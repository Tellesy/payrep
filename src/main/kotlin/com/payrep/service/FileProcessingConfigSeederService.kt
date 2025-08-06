package com.payrep.service

import com.payrep.domain.BankOrTPP
import com.payrep.domain.BankOrTPPType
import com.payrep.domain.FileProcessingConfig
import com.payrep.repository.BankOrTPPRepository
import com.payrep.repository.FileProcessingConfigRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Order(2)
class FileProcessingConfigSeederService(
    private val bankOrTPPRepository: BankOrTPPRepository,
    private val fileProcessingConfigRepository: FileProcessingConfigRepository
) : CommandLineRunner {

    private val logger = LoggerFactory.getLogger(FileProcessingConfigSeederService::class.java)

    @Transactional
    override fun run(vararg args: String?) {
        logger.info("Starting FileProcessingConfigSeederService...")
        
        // Force recreation of file processing configs for comprehensive automation
        logger.info("Clearing existing file processing configs to ensure fresh, accurate configurations...")
        fileProcessingConfigRepository.deleteAll()
        logger.info("Existing file processing configs cleared")

        logger.info("Seeding file processing configurations for all banks and TPPs...")
        
        val allBanksAndTPPs = bankOrTPPRepository.findAll()
        logger.info("Found ${allBanksAndTPPs.size} banks and TPPs to configure")

        var totalConfigsCreated = 0

        allBanksAndTPPs.forEach { bankOrTPP ->
            logger.info("Creating file processing configs for ${bankOrTPP.type} ${bankOrTPP.code} - ${bankOrTPP.name}")
            
            val configs = createFileProcessingConfigs(bankOrTPP)
            val savedConfigs = fileProcessingConfigRepository.saveAll(configs)
            
            logger.info("Created ${savedConfigs.size} file processing configs for ${bankOrTPP.code}")
            totalConfigsCreated += savedConfigs.size
        }

        logger.info("FileProcessingConfigSeederService completed. Created $totalConfigsCreated total configurations.")
    }

    private fun createFileProcessingConfigs(bankOrTPP: BankOrTPP): List<FileProcessingConfig> {
        val configs = mutableListOf<FileProcessingConfig>()
        
        // Determine directory path - use sample-data/{code} for both banks and TPPs
        val directoryPath = "sample-data/${bankOrTPP.code}"

        // Create configs for all standard report types
        val reportConfigs = listOf(
            // ATM Reports
            Triple(
                "atm_terminal_data_\\d{4}-\\d{2}-\\d{2}\\.csv",
                "ATM Terminal Data",
                "ATM terminal status and operational data"
            ),
            Triple(
                "atm_transaction_data_\\d{4}-\\d{2}-\\d{2}\\.csv", 
                "ATM Transaction Data",
                "ATM transaction records and analytics"
            ),
            
            // POS Reports
            Triple(
                "pos_terminal_data_\\d{4}-\\d{2}-\\d{2}\\.csv",
                "POS Terminal Data", 
                "POS terminal status and configuration"
            ),
            Triple(
                "pos_transaction_data_\\d{4}-\\d{2}-\\d{2}\\.csv",
                "POS Transaction Data",
                "POS transaction records and analytics"
            ),
            
            // Card Reports
            Triple(
                "card_lifecycle_\\d{4}-\\d{2}-\\d{2}\\.csv",
                "Card Lifecycle",
                "Card issuance, activation, and lifecycle management"
            ),
            Triple(
                "ecommerce_card_activity_\\d{4}-\\d{2}-\\d{2}\\.csv",
                "E-Commerce Card Activity",
                "E-commerce card transaction activity"
            ),
            
            // Transaction Volume Reports
            Triple(
                "transaction_volume_\\d{4}-\\d{2}-\\d{2}\\.csv",
                "Transaction Volume",
                "Overall transaction volume analytics"
            )
        )

        reportConfigs.forEach { (pattern, reportType, description) ->
            val config = FileProcessingConfig(
                bankOrTPP = bankOrTPP,
                directoryPath = directoryPath,
                fileNamePattern = pattern,
                fileType = "CSV", // Use CSV for parser compatibility
                scheduleTime = "0 */2 * * * ?" // Every 2 minutes
            )
            configs.add(config)
            
            logger.debug("Created config for ${bankOrTPP.code}: $reportType -> $pattern")
        }

        return configs
    }
}
