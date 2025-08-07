package com.payrep.service

import com.payrep.domain.*
import com.payrep.repository.*
import com.payrep.service.*
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.io.File
import java.io.FileWriter
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
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
    private val logFileName = "debug-logs/file-processing-${LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm-ss"))}.log"
    
    private fun logToFileAndConsole(message: String) {
        val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"))
        val logMessage = "[$timestamp] $message"
        
        // Console log
        logger.info(logMessage)
        
        // File log
        try {
            val logFile = File(logFileName)
            logFile.parentFile?.mkdirs()
            FileWriter(logFile, true).use { writer ->
                writer.appendLine(logMessage)
            }
        } catch (e: Exception) {
            logger.error("ERROR: Failed to write to log file: ${e.message}")
        }
    }

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
            val entityType = determineEntityTypeFromFileName(file.name)
            saveData(file.name, parsedData, entityType, config.bankOrTPP.code)
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

    private fun saveData(fileName: String, records: List<Map<String, Any>>, entityType: String, processorCode: String) {
        logToFileAndConsole("=== SAVE DATA DEBUG ===")
        logToFileAndConsole("File: $fileName, Processor: $processorCode, Entity Type: $entityType")
        logToFileAndConsole("Total records to process: ${records.size}")
        
        var successCount = 0
        var failureCount = 0
        
        records.forEachIndexed { index, record ->
            val recordIndex = index + 1
            logToFileAndConsole("Processing record $recordIndex of ${records.size}")
            
            try {
                var recordSaved = false
                when (entityType) {
                    "ATM Terminal Data" -> {
                        val entity = dataMapper.run { record.toAtmTerminalData(processorCode) }
                        if (entity != null) {
                            atmTerminalDataRepository.save(entity)
                            recordSaved = true
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
                        logToFileAndConsole("=== E-COMMERCE CARD ACTIVITY PROCESSING ===")
                        logToFileAndConsole("Processing E-Commerce Card Activity record $recordIndex for processor $processorCode")
                        logToFileAndConsole("Record data: $record")
                        logger.info("Processing E-Commerce Card Activity record for processor $processorCode")
                        logger.info("Record data: $record")
                        
                        logToFileAndConsole("Calling dataMapper.toECommerceCardActivity(processorCode=$processorCode)")
                        val entity = dataMapper.run { record.toECommerceCardActivity(processorCode) }
                        
                        if (entity != null) {
                            logToFileAndConsole("SUCCESS: Entity created successfully, saving to repository")
                            eCommerceCardActivityRepository.save(entity)
                            logToFileAndConsole("SUCCESS: Saved E-Commerce Card Activity record to database")
                            logger.info("SUCCESS: Saved E-Commerce Card Activity record for processor $processorCode")
                        } else {
                            logToFileAndConsole("CRITICAL ERROR: E-Commerce Card Activity record conversion returned NULL")
                            logToFileAndConsole("This means convertInstitutionId failed or entity creation failed")
                            logToFileAndConsole("Record that failed conversion: $record")
                            logger.error("FAILED: E-Commerce Card Activity record conversion returned null for processor $processorCode")
                            logger.error("Record that failed: $record")
                        }
                        logToFileAndConsole("=== END E-COMMERCE PROCESSING ===")
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
        logger.info("Completed saving ${records.size} records for entity type: $entityType")
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
