package com.payrep.controller

import com.opencsv.CSVReader
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.InputStreamReader

@RestController
@RequestMapping("/api/admin/wizard")
class FileWizardController {
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
}
