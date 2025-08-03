package com.payrep.service

import com.payrep.domain.*
import com.payrep.repository.*
import com.opencsv.CSVReader
import org.springframework.stereotype.Service
import java.io.File
import java.io.FileReader
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import org.slf4j.LoggerFactory

@Service
class FileParser(
    private val columnMappingRepository: ColumnMappingRepository
) {
    private val logger = LoggerFactory.getLogger(FileParser::class.java)

    fun parseFile(file: File, config: FileProcessingConfig): List<Map<String, Any>> {
        val mappings = columnMappingRepository.findByFileProcessingConfigId(config.id!!)
        return when (config.fileType.uppercase()) {
            "CSV" -> parseCsvFile(file, mappings)
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
            val columnIndices = headers.mapIndexed { index, header -> header to index }.toMap()

            var line: Array<String>? = reader.readNext()
            while (line != null) {
                val record = mutableMapOf<String, Any>()
                mappings.forEach { mapping ->
                    val columnIndex = columnIndices[mapping.columnName]
                    if (columnIndex != null && columnIndex < line!!.size) {
                        val value = line!![columnIndex]
                        record[mapping.fieldName] = applyTransformation(value, mapping.transformation)
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
            "date:yyyy-mm-dd" -> LocalDateTime.parse(value, DateTimeFormatter.ISO_DATE)
            "number" -> value.toDoubleOrNull() ?: value
            "trim" -> value.trim()
            "uppercase" -> value.uppercase()
            else -> value
        }
    }
}
