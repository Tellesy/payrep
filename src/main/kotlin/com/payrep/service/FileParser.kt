package com.payrep.service

import com.payrep.domain.*
import com.payrep.repository.*
import com.opencsv.CSVReader
import org.springframework.stereotype.Service
import java.io.File
import java.io.FileReader
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import org.slf4j.LoggerFactory

@Service
class FileParser(
    private val columnMappingRepository: ColumnMappingRepository,
    private val headerDefinitionRepository: HeaderDefinitionRepository,
    private val headerAliasRepository: HeaderAliasRepository
) {
    private val logger = LoggerFactory.getLogger(FileParser::class.java)
    private val logFileName = "debug-logs/file-processing-${LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm-ss"))}.log"

    private fun logToFile(message: String) {
        val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"))
        val logMessage = "[$timestamp] $message"
        try {
            val logFile = java.io.File(logFileName)
            logFile.parentFile?.mkdirs()
            java.io.FileWriter(logFile, true).use { it.appendLine(logMessage) }
        } catch (_: Exception) {
            // swallow - avoid impacting processing
        }
    }

    fun parseFile(file: File, config: FileProcessingConfig): List<Map<String, Any>> {
        logger.info("🔍 Parsing file: ${file.name} for config ID: ${config.id} (${config.fileType})")
        
        val mappings = columnMappingRepository.findByFileProcessingConfigId(config.id!!)
        logger.info("📋 Found ${mappings.size} column mappings for config ID: ${config.id}")
        
        if (mappings.isEmpty()) {
            logger.error("❌ No column mappings found for config ID: ${config.id}. Cannot parse file without mappings!")
            throw IllegalArgumentException("No column mappings configured for file processing config ID: ${config.id}")
        }
        
        mappings.forEach { mapping ->
            logger.info("  📌 Mapping: ${mapping.columnName} -> ${mapping.fieldName} (transform: ${mapping.transformation})")
        }
        
        // Support both format types (CSV, EXCEL) and descriptive types (E-Commerce Card Activity, etc.)
        val isCSVFormat = config.fileType.uppercase() == "CSV" || 
                         config.fileType in listOf("E-Commerce Card Activity", "POS Terminal Data", "POS Transaction Data", 
                                                   "ATM Terminal Data", "ATM Transaction Data", "Card Lifecycle", "Transaction Volume")
        logger.info("📄 File type '${config.fileType}' is CSV format: $isCSVFormat")
        logToFile("Parser: File=${file.name}, ConfigId=${config.id}, CSVFormat=$isCSVFormat")
        
        return when {
            isCSVFormat -> parseCsvFile(file, mappings)
            config.fileType.uppercase() == "EXCEL" -> throw IllegalArgumentException("Excel parsing not yet implemented")
            else -> throw IllegalArgumentException("Unsupported file type: ${config.fileType}")
        }
    }

    private fun parseCsvFile(file: File, mappings: List<ColumnMapping>): List<Map<String, Any>> {
        val records = mutableListOf<Map<String, Any>>()
        val reader = CSVReader(FileReader(file))
        try {
            val headers = reader.readNext()?.toList()
            if (headers.isNullOrEmpty()) {
                return emptyList()
            }
            // Build index of headers from the file
            val columnIndices = headers.mapIndexed { index, header -> header to index }.toMap()
            logger.info("🧭 CSV header row (${headers.size}): ${headers}")
            logToFile("Parser: Headers=${headers}")

            // Group mappings by entity type to resolve dynamic header definitions
            val entityType = mappings.firstOrNull()?.entityType
            if (entityType != null) {
                logger.info("🔑 Resolving dynamic headers for entity type: $entityType")
                logToFile("Parser: Resolving headers for entityType=$entityType")
            }

            var line: Array<String>? = reader.readNext()
            while (line != null) {
                val record = mutableMapOf<String, Any>()
                mappings.forEach { mapping ->
                    // Try in this order:
                    // 1) Exact header match from mapping.columnName (backward compatible)
                    // 2) HeaderDefinition by key (= mapping.fieldName) -> displayName
                    // 3) Any HeaderAlias linked to the definition
                    // 4) Fallback: try simple case variants

                    var columnIndex: Int? = columnIndices[mapping.columnName]

                    if (columnIndex == null && entityType != null) {
                        val def = headerDefinitionRepository.findByEntityTypeAndKey(entityType, mapping.fieldName)
                        if (def != null) {
                            // Try current displayName
                            columnIndex = columnIndices[def.displayName]
                            if (columnIndex == null) {
                                // Try aliases
                                val aliases = headerAliasRepository.findByHeaderDefinition(def)
                                for (alias in aliases) {
                                    columnIndex = columnIndices[alias.alias]
                                    if (columnIndex != null) break
                                }
                            }
                            if (columnIndex != null) {
                                val msg = "✅ Resolved header for key='${mapping.fieldName}' via HeaderDefinition '${def.displayName}' at index $columnIndex"
                                logger.debug(msg)
                                logToFile("Parser: ${msg}")
                            } else {
                                val msg = "⚠️ Could not resolve dynamic header for key='${mapping.fieldName}', will try case variants"
                                logger.debug(msg)
                                logToFile("Parser: ${msg}")
                            }
                        }
                    }

                    if (columnIndex == null) {
                        // Try case-insensitive match for robustness
                        val matched = columnIndices.entries.firstOrNull { it.key.equals(mapping.columnName, ignoreCase = true) }
                        columnIndex = matched?.value
                    }

                    if (columnIndex != null && columnIndex < line!!.size) {
                        val value = line!![columnIndex]
                        record[mapping.fieldName] = applyTransformation(value, mapping.transformation)
                    } else {
                        val msg = "🚫 No column found for mapping '${mapping.columnName}' (key='${mapping.fieldName}') in file ${file.name}"
                        logger.debug(msg)
                        logToFile("Parser: ${msg}")
                    }
                }
                records.add(record)
                line = reader.readNext()
            }
        } finally {
            reader.close()
        }
        return records
    }

    private fun applyTransformation(value: String, transformation: String?): Any {
        if (transformation == null || transformation.isEmpty()) {
            return value
        }

        return when (transformation.lowercase()) {
            "date:yyyy-mm-dd" -> LocalDate.parse(value, DateTimeFormatter.ISO_DATE)
            "number" -> value.toDoubleOrNull() ?: value
            "trim" -> value.trim()
            "uppercase" -> value.uppercase()
            else -> value
        }
    }
}
