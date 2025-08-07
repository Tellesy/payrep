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
    private val dataMapper: DataMapper,
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
            saveData(parsedData, config.fileType, config.bankOrTPP.code, file.name)
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

    private fun saveData(data: List<Map<String, Any>>, fileType: String, processorCode: String, fileName: String) {
        // Determine entity type from file name since all configs now use fileType="CSV"
        val entityType = determineEntityTypeFromFileName(fileName)
        logger.info("Determined entity type '$entityType' for file: $fileName")
        
        data.forEach { record ->
            try {
                when (entityType) {
                    "ATM Terminal Data" -> {
                        val entity = dataMapper.run { record.toAtmTerminalData(processorCode) }
                        if (entity != null) {
                            atmTerminalDataRepository.save(entity)
                            logger.debug("Saved ATM Terminal Data record for processor $processorCode")
                        } else {
                            logger.warn("Skipped ATM Terminal Data record due to institution conversion failure")
                        }
                    }
                    "ATM Transaction Data" -> {
                        val entity = dataMapper.run { record.toAtmTransactionData(processorCode) }
                        if (entity != null) {
                            atmTransactionDataRepository.save(entity)
                            logger.debug("Saved ATM Transaction Data record for processor $processorCode")
                        } else {
                            logger.warn("Skipped ATM Transaction Data record due to institution conversion failure")
                        }
                    }
                    "Card Lifecycle" -> {
                        val entity = dataMapper.run { record.toCardLifecycle(processorCode) }
                        if (entity != null) {
                            cardLifecycleRepository.save(entity)
                            logger.debug("Saved Card Lifecycle record for processor $processorCode")
                        } else {
                            logger.warn("Skipped Card Lifecycle record due to institution conversion failure")
                        }
                    }
                    "E-Commerce Card Activity" -> {
                        logger.info("Processing E-Commerce Card Activity record for processor $processorCode")
                        logger.info("Record data: $record")
                        val entity = dataMapper.run { record.toECommerceCardActivity(processorCode) }
                        if (entity != null) {
                            eCommerceCardActivityRepository.save(entity)
                            logger.info("SUCCESS: Saved E-Commerce Card Activity record for processor $processorCode")
                        } else {
                            logger.error("FAILED: E-Commerce Card Activity record conversion returned null for processor $processorCode")
                            logger.error("Record that failed: $record")
                        }
                    }
                    "POS Terminal Data" -> {
                        val entity = dataMapper.run { record.toPosTerminalData(processorCode) }
                        if (entity != null) {
                            posTerminalDataRepository.save(entity)
                            logger.debug("Saved POS Terminal Data record for processor $processorCode")
                        } else {
                            logger.warn("Skipped POS Terminal Data record due to institution conversion failure")
                        }
                    }
                    "POS Transaction Data" -> {
                        val entity = dataMapper.run { record.toPosTransactionData(processorCode) }
                        if (entity != null) {
                            posTransactionDataRepository.save(entity)
                            logger.debug("Saved POS Transaction Data record for processor $processorCode")
                        } else {
                            logger.warn("Skipped POS Transaction Data record due to institution conversion failure")
                        }
                    }
                    "Transaction Volume" -> {
                        val entity = dataMapper.run { record.toTransactionVolume(processorCode, fileName) }
                        if (entity != null) {
                            transactionVolumeRepository.save(entity)
                            logger.debug("Saved Transaction Volume record for processor $processorCode")
                        } else {
                            logger.warn("Skipped Transaction Volume record due to institution conversion failure")
                        }
                    }
                    else -> {
                        logger.warn("Unsupported entity type for data saving: $entityType (from file: $fileName)")
                        logger.warn("Available entity types: ATM Terminal Data, ATM Transaction Data, Card Lifecycle, E-Commerce Card Activity, POS Terminal Data, POS Transaction Data, Transaction Volume")
                    }
                }
            } catch (e: Exception) {
                logger.error("Error saving record for entity type $entityType, processor $processorCode: ${e.message}", e)
                // Continue processing other records instead of failing the entire file
            }
        }
        logger.info("Completed saving ${data.size} records for entity type: $entityType")
    }
    
    private fun determineEntityTypeFromFileName(fileName: String): String {
        return when {
            fileName.contains("atm_terminal_data", ignoreCase = true) -> "ATM Terminal Data"
            fileName.contains("atm_transaction_data", ignoreCase = true) -> "ATM Transaction Data"
            fileName.contains("card_lifecycle", ignoreCase = true) -> "Card Lifecycle"
            fileName.contains("ecommerce_card_activity", ignoreCase = true) -> "E-Commerce Card Activity"
            fileName.contains("pos_terminal_data", ignoreCase = true) -> "POS Terminal Data"
            fileName.contains("pos_transaction_data", ignoreCase = true) -> "POS Transaction Data"
            fileName.contains("transaction_volume", ignoreCase = true) -> "Transaction Volume"
            else -> {
                logger.warn("Could not determine entity type from file name: $fileName")
                "Unknown"
            }
        }
    }
}
