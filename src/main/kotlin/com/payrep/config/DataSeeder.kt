package com.payrep.config

import com.payrep.domain.*
import com.payrep.repository.*
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.LocalDateTime

@Configuration
class DataSeeder {
    @Bean
    fun seedData(
        bankRepository: BankOrTPPRepository,
        fileConfigRepository: FileProcessingConfigRepository,
        columnMappingRepository: ColumnMappingRepository
    ): CommandLineRunner {
        return CommandLineRunner {
            // Seed example banks
            val bank1 = BankOrTPP(
                code = "B01",
                name = "Libyan Commercial Bank",
                type = BankOrTPPType.BANK
            )
            
            val bank2 = BankOrTPP(
                code = "B02",
                name = "Al-Baraka Bank",
                type = BankOrTPPType.BANK
            )
            
            val banks = listOf(bank1, bank2)
            val savedBanks = bankRepository.saveAll(banks)

            // Seed example TPP
            val tpp = BankOrTPP(
                code = "T01",
                name = "Libyan Payment Network",
                type = BankOrTPPType.TPP
            )
            val savedTpp = bankRepository.save(tpp)

            // Seed file processing configs for banks
            val bankConfig1 = FileProcessingConfig(
                bankOrTPP = savedBanks[0],
                directoryPath = "/data/bank_reports/b01",
                fileNamePattern = "B01_.*\.csv",
                scheduleTime = "0 15 0 * * ?", // Daily at 00:15
                fileType = "CSV"
            )

            val bankConfig2 = FileProcessingConfig(
                bankOrTPP = savedBanks[1],
                directoryPath = "/data/bank_reports/b02",
                fileNamePattern = "B02_.*\.csv",
                scheduleTime = "0 15 0 * * ?",
                fileType = "CSV"
            )

            // Seed file processing config for TPP
            val tppConfig = FileProcessingConfig(
                bankOrTPP = savedTpp,
                directoryPath = "/data/tpp_reports",
                fileNamePattern = "T01_.*\.csv",
                scheduleTime = "0 15 0 * * ?",
                fileType = "CSV"
            )

            val savedConfigs = fileConfigRepository.saveAll(listOf(bankConfig1, bankConfig2, tppConfig))

            // Seed column mappings
            val cardIssuanceMappings = listOf(
                ColumnMapping(
                    fileProcessingConfig = savedConfigs[0],
                    columnName = "card_number",
                    entityType = "CardIssuance",
                    fieldName = "cardNumber"
                ),
                ColumnMapping(
                    fileProcessingConfig = savedConfigs[0],
                    columnName = "issue_date",
                    entityType = "CardIssuance",
                    fieldName = "issueDate"
                ),
                ColumnMapping(
                    fileProcessingConfig = savedConfigs[0],
                    columnName = "card_type",
                    entityType = "CardIssuance",
                    fieldName = "cardType"
                )
            )

            columnMappingRepository.saveAll(cardIssuanceMappings)
        }
    }
}
