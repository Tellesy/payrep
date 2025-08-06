package com.payrep.service

import com.payrep.domain.*
import com.payrep.repository.*
import com.payrep.service.*
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.io.File
import java.time.LocalDateTime
import org.slf4j.LoggerFactory

@Service
class FileIngestionService(
    private val fileConfigRepository: FileProcessingConfigRepository,
    private val importLogRepository: ImportLogRepository,
    private val fileParser: FileParser,
    private val atmTerminalDataRepository: AtmTerminalDataRepository,
    private val atmTransactionDataRepository: AtmTransactionDataRepository,
    private val cardLifecycleRepository: CardLifecycleRepository,
    private val eCommerceCardActivityRepository: ECommerceCardActivityRepository,
    private val posTerminalDataRepository: PosTerminalDataRepository,
    private val posTransactionDataRepository: PosTransactionDataRepository,
    private val transactionVolumeRepository: TransactionVolumeRepository
) {
    private val logger = LoggerFactory.getLogger(FileIngestionService::class.java)

    @Scheduled(cron = "0 */2 * * * ?") // Every 2 minutes - matches TPP 901 schedule
    fun processFiles() {
        logger.info("Starting file processing job at ${LocalDateTime.now()}")
        
        val configs = fileConfigRepository.findAll()
        logger.info("Found ${configs.size} file processing configurations")
        
        configs.forEach { config ->
            logger.info("Processing config ID: ${config.id} for ${config.bankOrTPP.code} - ${config.fileType}")
            logger.info("Directory: ${config.directoryPath}, Pattern: ${config.fileNamePattern}")
            processConfig(config)
        }
        
        logger.info("Completed file processing job at ${LocalDateTime.now()}")
    }

    private fun processConfig(config: FileProcessingConfig) {
        logger.info("Processing config for ${config.bankOrTPP.code} - ${config.fileType}")
        logger.info("Looking in directory: ${config.directoryPath}")
        logger.info("File pattern: ${config.fileNamePattern}")
        
        val directory = File(config.directoryPath)
        if (!directory.exists() || !directory.isDirectory) {
            logger.error("Directory does not exist or is not accessible: ${config.directoryPath}")
            return
        }
        
        logger.info("Directory exists, listing all files...")
        val allFiles = directory.listFiles() ?: emptyArray()
        logger.info("Found ${allFiles.size} total files in directory")
        
        if (allFiles.isNotEmpty()) {
            logger.info("All files in directory:")
            allFiles.forEach { file ->
                logger.info("  - ${file.name} (matches pattern: ${file.name.matches(config.fileNamePattern.toRegex())})")
            }
        }

        val files = directory.listFiles { file ->
            val matches = file.name.matches(config.fileNamePattern.toRegex())
            logger.info("File ${file.name} matches pattern ${config.fileNamePattern}: $matches")
            matches
        } ?: emptyArray()
        
        logger.info("Found ${files.size} files matching pattern for ${config.fileType}")

        files.forEach { file ->
            logger.info("Processing file: ${file.name}")
            processFile(config, file)
        }
        
        if (files.isEmpty()) {
            logger.warn("No files found matching pattern '${config.fileNamePattern}' in directory '${config.directoryPath}'")
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
            saveData(parsedData, config.fileType, file.name)
            val updatedLog = importLogSaved.copy(status = ImportLog.ImportStatus.SUCCESS)
            importLogRepository.save(updatedLog)
            
            logger.info("Successfully processed file: ${file.name}")
            
            // Move processed file to archive directory
            val archiveDir = File("${config.directoryPath}/archive")
            archiveDir.mkdirs()
            file.renameTo(File("${archiveDir.absolutePath}/${file.name}"))
        } catch (e: Exception) {
            logger.error("Error processing file ${file.name}", e)
            val failedLog = importLog.copy(status = ImportLog.ImportStatus.FAILED, errorMessage = e.message)
            importLogRepository.save(failedLog)
        }
    }

    private fun saveData(data: List<Map<String, Any>>, fileType: String, fileName: String) {
        data.forEach { record ->
            when (fileType) {
                "ATM Terminal Data" -> atmTerminalDataRepository.save(record.toAtmTerminalData())
                "ATM Transaction Data" -> atmTransactionDataRepository.save(record.toAtmTransactionData())
                "Card Lifecycle" -> cardLifecycleRepository.save(record.toCardLifecycle())
                "E-Commerce Card Activity" -> eCommerceCardActivityRepository.save(record.toECommerceCardActivity())
                "POS Terminal Data" -> posTerminalDataRepository.save(record.toPosTerminalData())
                "POS Transaction Data" -> posTransactionDataRepository.save(record.toPosTransactionData())
                "Transaction Volume" -> transactionVolumeRepository.save(record.toTransactionVolume(fileName))
                else -> logger.warn("Unsupported file type for data saving: $fileType")
            }
        }
    }
}
