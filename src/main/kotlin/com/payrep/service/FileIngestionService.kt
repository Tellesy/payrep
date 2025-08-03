package com.payrep.service

import com.payrep.domain.*
import com.payrep.repository.*
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.io.File
import java.time.LocalDateTime
import org.slf4j.LoggerFactory

@Service
class FileIngestionService(
    private val fileConfigRepository: FileProcessingConfigRepository,
    private val importLogRepository: ImportLogRepository,
    private val fileParser: FileParser
) {
    private val logger = LoggerFactory.getLogger(FileIngestionService::class.java)

    @Scheduled(cron = "0 0/15 * * * ?") // Every 15 minutes
    fun processFiles() {
        logger.info("Starting file processing job at ${LocalDateTime.now()}")
        
        val configs = fileConfigRepository.findAll()
        configs.forEach { config ->
            processConfig(config)
        }
    }

    private fun processConfig(config: FileProcessingConfig) {
        val directory = File(config.directoryPath)
        if (!directory.exists() || !directory.isDirectory) {
            logger.error("Directory does not exist or is not accessible: ${config.directoryPath}")
            return
        }

        val files = directory.listFiles { file ->
            file.name.matches(config.fileNamePattern.toRegex())
        } ?: emptyArray()

        files.forEach { file ->
            processFile(config, file)
        }
    }

    private fun processFile(config: FileProcessingConfig, file: File) {
        val importLog = ImportLog(
            fileProcessingConfig = config,
            fileName = file.name,
            importTime = LocalDateTime.now(),
            status = ImportLog.ImportStatus.PENDING
        )

        try {
            val importLogSaved = importLogRepository.save(importLog)
            
            logger.info("Processing file: ${file.name}")
            
            val parsedData = fileParser.parseFile(file, config)
            
            // TODO: Save parsed data to appropriate tables
            // This will be implemented based on the column mappings
            
            importLogSaved.status = ImportLog.ImportStatus.SUCCESS
            importLogRepository.save(importLogSaved)
            
            logger.info("Successfully processed file: ${file.name}")
            
            // Move processed file to archive directory
            val archiveDir = File("${config.directoryPath}/archive")
            archiveDir.mkdirs()
            file.renameTo(File("${archiveDir.absolutePath}/${file.name}"))
        } catch (e: Exception) {
            logger.error("Error processing file ${file.name}", e)
            importLog.status = ImportLog.ImportStatus.FAILED
            importLog.errorMessage = e.message
            importLogRepository.save(importLog)
        }
    }
}
