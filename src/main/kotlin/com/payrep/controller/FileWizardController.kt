package com.payrep.controller

import com.payrep.config.WizardEntityConfig
import com.opencsv.CSVReader
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.InputStreamReader
import jakarta.persistence.*

@RestController
@RequestMapping("/api/admin/wizard")
class FileWizardController(
    private val wizardEntityConfig: WizardEntityConfig
) {
    private val logger = LoggerFactory.getLogger(FileWizardController::class.java)

    data class DetectedColumn(
        val name: String,
        val index: Int,
        val sampleValues: List<String>
    )

    data class DetectionResult(
        val fileName: String,
        val delimiter: String,
        val columnCount: Int,
        val columns: List<DetectedColumn>,
        val rowCountPreviewed: Int
    )

    // --- Step 3: Mapping DTOs ---
    data class MappingEntry(
        val columnIndex: Int,
        val columnName: String,
        val targetField: String
    )

    data class SaveMappingsRequest(
        val sourceId: Long,
        val fileName: String,
        val delimiter: String,
        val entityName: String,
        val mappings: List<MappingEntry>
    )

    // --- Entity descriptors to guide mapping UI ---
    data class FieldDescriptor(
        val name: String,
        val type: String,
        val required: Boolean
    )

    data class EntityDescriptor(
        val name: String,
        val fields: List<FieldDescriptor>
    )

    private fun kotlinTypeToSimpleName(type: Class<*>): String {
        return when (type.name) {
            "java.lang.String" -> "String"
            "java.lang.Integer", "int" -> "Int"
            "java.lang.Long", "long" -> "Long"
            "java.math.BigDecimal" -> "BigDecimal"
            "java.time.LocalDate" -> "LocalDate"
            "java.lang.Boolean", "boolean" -> "Boolean"
            else -> type.simpleName
        }
    }

    private fun describeEntity(className: String): EntityDescriptor? {
        return try {
            val clazz = Class.forName(className)
            val fields = mutableListOf<FieldDescriptor>()
            clazz.declaredFields.forEach { f ->
                // Skip Kotlin synthetic/companion/backing fields
                if (f.name.startsWith("$") || f.name == "Companion") return@forEach
                if (f.isAnnotationPresent(Id::class.java)) return@forEach // don't map primary key id

                val manyToOne = f.getAnnotation(ManyToOne::class.java)
                val joinCol = f.getAnnotation(JoinColumn::class.java)
                val col = f.getAnnotation(Column::class.java)

                if (manyToOne != null && joinCol != null) {
                    // Expose FK column instead of object reference
                    val fkName = joinCol.name.ifBlank { f.name + "_id" }
                    val required = !joinCol.nullable
                    fields.add(FieldDescriptor(name = fkName, type = "Long", required = required))
                } else {
                    val required = col?.let { !it.nullable } ?: false
                    fields.add(
                        FieldDescriptor(
                            name = f.name,
                            type = kotlinTypeToSimpleName(f.type),
                            required = required
                        )
                    )
                }
            }
            EntityDescriptor(name = clazz.simpleName, fields = fields.sortedBy { it.name.lowercase() })
        } catch (ex: ClassNotFoundException) {
            logger.warn("Entity class not found for wizard descriptor: {}", className)
            null
        }
    }

    @PostMapping("/detect", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun detectStructure(
        @RequestPart("file") file: MultipartFile,
        @RequestParam(name = "maxRows", defaultValue = "20") maxRows: Int
    ): ResponseEntity<DetectionResult> {
        if (file.isEmpty) {
            return ResponseEntity.badRequest().build()
        }
        // Basic CSV only for now; Excel support can be added via Apache POI later
        val delimiter = "," // We can enhance to auto-detect ; or \t later
        val reader = CSVReader(InputStreamReader(file.inputStream))
        try {
            val headerRow = reader.readNext()?.toList() ?: emptyList()
            val sampleBuckets = MutableList(headerRow.size) { mutableListOf<String>() }
            var count = 0
            var row = reader.readNext()
            while (row != null && count < maxRows) {
                for (i in 0 until minOf(headerRow.size, row.size)) {
                    if (sampleBuckets[i].size < 5) { // keep up to 5 samples per column
                        sampleBuckets[i].add(row[i])
                    }
                }
                count++
                row = reader.readNext()
            }
            val columns = headerRow.mapIndexed { idx, name ->
                DetectedColumn(name = name, index = idx, sampleValues = sampleBuckets[idx])
            }
            val result = DetectionResult(
                fileName = file.originalFilename ?: "uploaded.csv",
                delimiter = delimiter,
                columnCount = headerRow.size,
                columns = columns,
                rowCountPreviewed = count
            )
            logger.info("Wizard detect: file=${'$'}{result.fileName}, columns=${'$'}{result.columnCount}, previewedRows=${'$'}{result.rowCountPreviewed}")
            return ResponseEntity.ok(result)
        } finally {
            reader.close()
        }
    }

    @GetMapping("/entities", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun listEntities(): ResponseEntity<List<EntityDescriptor>> {
        // Reflectively describe all core domain entities
        val coreClassNames = listOf(
            "com.payrep.domain.AtmTerminalData",
            "com.payrep.domain.AtmTransactionData",
            "com.payrep.domain.CardIssuance",
            "com.payrep.domain.CardLifecycle",
            "com.payrep.domain.ECommerceCardActivity",
            "com.payrep.domain.PosTerminalData",
            "com.payrep.domain.PosTransactionData"
        )
        val reflected = coreClassNames.mapNotNull { describeEntity(it) }

        // Merge with dynamic entities from application.yml (wizard.dynamicEntities)
        val dynamic = wizardEntityConfig.dynamicEntities.map { de ->
            EntityDescriptor(
                name = de.name,
                fields = de.fields.map { f -> FieldDescriptor(f.name, f.type, f.required) }
            )
        }

        val merged = (reflected + dynamic).distinctBy { it.name }
        return ResponseEntity.ok(merged)
    }

    @PostMapping("/mappings", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun saveMappings(@RequestBody body: SaveMappingsRequest): ResponseEntity<Void> {
        // For now, we just log and return 200. Later: persist to DB (FileProcessingConfig/ColumnMappings)
        logger.info(
            "Wizard mappings: sourceId={}, entity={}, file={}, delimiter='{}', mappedColumns={}",
            body.sourceId,
            body.entityName,
            body.fileName,
            body.delimiter,
            body.mappings.size
        )
        body.mappings.forEach {
            logger.info(" - index={}, name='{}' -> target='{}'", it.columnIndex, it.columnName, it.targetField)
        }
        return ResponseEntity.ok().build()
    }
}
