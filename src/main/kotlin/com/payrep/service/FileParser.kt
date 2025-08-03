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

    fun parseFile(file: File, config: FileProcessingConfig): Map<String, Any> {
        val mappings = columnMappingRepository.findByFileProcessingConfigId(config.id!!)
        val parsedData = mutableMapOf<String, Any>()

        when (config.fileType.uppercase()) {
            "CSV" -> parseCsvFile(file, mappings, parsedData)
            // Add other file types as needed
            else -> throw IllegalArgumentException("Unsupported file type: ${config.fileType}")
        }

        return parsedData
    }

    private fun parseCsvFile(
        file: File,
        mappings: List<ColumnMapping>,
        parsedData: MutableMap<String, Any>
    ) {
        val reader = CSVReader(FileReader(file))
        val headers = reader.readNext()
        
        if (headers == null) {
            throw IllegalStateException("CSV file is empty")
        }

        val columnIndices = mutableMapOf<String, Int>()
        headers.forEachIndexed { index, header ->
            columnIndices[header] = index
        }

        val records = mutableListOf<Map<String, Any>>()
        var line = reader.readNext()
        
        while (line != null) {
            val record = mutableMapOf<String, Any>()
            mappings.forEach { mapping ->
                val columnIndex = columnIndices[mapping.columnName]
                if (columnIndex != null) {
                    val value = line[columnIndex]
                    val transformedValue = applyTransformation(value, mapping.transformation)
                    
                    // Create nested structure based on entity type
                    val entityData = parsedData.getOrPut(mapping.entityType) { mutableMapOf<String, Any>() }
                    (entityData as MutableMap<String, Any>)[mapping.fieldName] = transformedValue
                }
            }
            records.add(record)
            line = reader.readNext()
        }

        reader.close()
        parsedData["records"] = records
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
