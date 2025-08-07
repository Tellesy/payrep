package com.payrep.service

import com.payrep.domain.*
import com.payrep.repository.*
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
@Order(1)
class DataSeederService(
    private val bankOrTPPRepository: BankOrTPPRepository,
    private val fileProcessingConfigRepository: FileProcessingConfigRepository
) : CommandLineRunner {
    
    private val logger = LoggerFactory.getLogger(DataSeederService::class.java)

    @Transactional
    override fun run(vararg args: String?) {
        logger.info("Starting data seeding...")
        
        seedBanksAndTPPs()
        seedFileProcessingConfigs()
        
        logger.info("Data seeding completed successfully!")
    }

    private fun seedBanksAndTPPs() {
        if (bankOrTPPRepository.count() > 0) {
            logger.info("Banks and TPPs already exist, skipping seeding")
            return
        }

        logger.info("Seeding banks and TPPs...")

        val banks = listOf(
            // Banks - matching the official bank codes and names
            BankOrTPP(code = "002", name = "Jumhouria Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "004", name = "National Commercial Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "010", name = "Bank of Commerce & Development", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "006", name = "Sahara Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "005", name = "Wahda Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "007", name = "North Africa Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "012", name = "Waha Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "013", name = "Aman Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "016", name = "First Libyan Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "020", name = "ATIB", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "021", name = "UBC Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "017", name = "UBC Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "015", name = "Libyan Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "018", name = "Meditbank Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "014", name = "National Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "025", name = "Libyan Islamic Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "023", name = "Development Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "026", name = "Central Bank", type = BankOrTPPType.BANK, useConverter = false),
            BankOrTPP(code = "027", name = "Andalus Bank", type = BankOrTPPType.BANK, useConverter = false),
            
            // TPPs
            BankOrTPP(code = "999", name = "Moamalat TPP", type = BankOrTPPType.TPP, useConverter = false),
            BankOrTPP(code = "901", name = "Tadawul TPP", type = BankOrTPPType.TPP, useConverter = true),
            BankOrTPP(code = "902", name = "Obour TPP", type = BankOrTPPType.TPP, useConverter = false)
        )

        bankOrTPPRepository.saveAll(banks)
        logger.info("Seeded ${banks.size} banks and TPPs")
    }

    private fun seedFileProcessingConfigs() {
        if (fileProcessingConfigRepository.count() > 0) {
            logger.info("File processing configs already exist, skipping seeding")
            return
        }

        logger.info("Seeding file processing configs...")
        
        val allInstitutions = bankOrTPPRepository.findAll()
        val configs = mutableListOf<FileProcessingConfig>()
        
        val reportTypes = listOf(
            "ATM Terminal Data",
            "ATM Transaction Data", 
            "POS Terminal Data",
            "POS Transaction Data",
            "Card Lifecycle",
            "E-Commerce Card Activity",
            "Transaction Volume"
        )
        
        allInstitutions.forEach { institution ->
            reportTypes.forEach { reportType ->
                val directoryPath = if (institution.type == BankOrTPPType.BANK) {
                    "sample-data/banks/${institution.code}"
                } else {
                    "sample-data/${institution.code}"
                }
                
                val fileNamePattern = when (reportType) {
                    "ATM Terminal Data" -> "atm_terminal_data_\\d{4}-\\d{2}-\\d{2}\\.csv"
                    "ATM Transaction Data" -> "atm_transaction_data_\\d{4}-\\d{2}-\\d{2}\\.csv"
                    "POS Terminal Data" -> "pos_terminal_data_\\d{4}-\\d{2}-\\d{2}\\.csv"
                    "POS Transaction Data" -> "pos_transaction_data_\\d{4}-\\d{2}-\\d{2}\\.csv"
                    "Card Lifecycle" -> "card_lifecycle_\\d{4}-\\d{2}-\\d{2}\\.csv"
                    "E-Commerce Card Activity" -> "ecommerce_card_activity_\\d{4}-\\d{2}-\\d{2}\\.csv"
                    "Transaction Volume" -> "transaction_volume_\\d{4}-\\d{2}-\\d{2}\\.csv"
                    else -> ".*\\.csv"
                }
                
                configs.add(
                    FileProcessingConfig(
                        bankOrTPP = institution,
                        fileType = "CSV",
                        directoryPath = directoryPath,
                        fileNamePattern = fileNamePattern,
                        scheduleTime = "0 */2 * * * ?" // Every 2 minutes
                    )
                )
            }
        }
        
        fileProcessingConfigRepository.saveAll(configs)
        logger.info("Seeded ${configs.size} file processing configs")
    }
}
