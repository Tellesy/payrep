package com.payrep.services

import com.opencsv.CSVReader
import com.payrep.entities.*
import com.payrep.repositories.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.FileReader
import java.time.LocalDateTime
import java.util.*

@Service
class FileProcessor(
    private val bankOrTppRepository: BankOrTPPRepository,
    private val fileProcessingConfigRepository: FileProcessingConfigRepository,
    private val importLogRepository: ImportLogRepository
) {
    private val logger = LoggerFactory.getLogger(FileProcessor::class.java)

    fun processFiles() {
        val configs = fileProcessingConfigRepository.findAll()
        configs.forEach { config ->
            processConfig(config)
        }
    }

    private fun processConfig(config: FileProcessingConfig) {
        val log = ImportLog(
            bankOrTPP = config.bankOrTPP,
            fileName = "",
            importTime = LocalDateTime.now(),
            status = ImportLog.Status.PENDING
        )

        try {
            // Find matching files
            val files = findMatchingFiles(config.directoryPath, config.filenamePattern)
            if (files.isEmpty()) {
                logger.info("No files found for config: ${config.id}")
                return
            }

            // Process each file
            files.forEach { file ->
                processFile(config, file)
            }

            log.status = ImportLog.Status.SUCCESS
        } catch (e: Exception) {
            log.status = ImportLog.Status.FAILED
            log.errorMessage = e.message
            logger.error("Error processing files for config: ${config.id}", e)
        } finally {
            importLogRepository.save(log)
        }
    }

    private fun findMatchingFiles(directory: String, pattern: String): List<String> {
        // TODO: Implement actual file matching logic
        return emptyList()
    }

    private fun processFile(config: FileProcessingConfig, fileName: String) {
        val log = ImportLog(
            bankOrTPP = config.bankOrTPP,
            fileName = fileName,
            importTime = LocalDateTime.now(),
            status = ImportLog.Status.PENDING
        )

        try {
            when (config.fileFormat) {
                FileProcessingConfig.FileFormat.CSV -> processCsvFile(config, fileName)
                FileProcessingConfig.FileFormat.EXCEL -> TODO("Excel processing not implemented")
                FileProcessingConfig.FileFormat.TSV -> TODO("TSV processing not implemented")
            }
            log.status = ImportLog.Status.SUCCESS
        } catch (e: Exception) {
            log.status = ImportLog.Status.FAILED
            log.errorMessage = e.message
            logger.error("Error processing file: $fileName", e)
        } finally {
            importLogRepository.save(log)
        }
    }

    private fun processCsvFile(config: FileProcessingConfig, fileName: String) {
        val reader = CSVReader(FileReader(fileName))
        val headers = reader.readNext()
        val rows = reader.readAll()

        // TODO: Implement actual CSV parsing and mapping logic
        // This will depend on the specific file format and mapping configuration
    }
}
