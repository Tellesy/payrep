package com.payrep.config

import com.payrep.domain.BankOrTPP
import com.payrep.domain.BankOrTPPType
import com.payrep.domain.FileProcessingConfig
import com.payrep.repository.BankOrTPPRepository
import com.payrep.repository.FileProcessingConfigRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class DataSeeder(
    private val bankOrTPPRepository: BankOrTPPRepository,
    private val fileProcessingConfigRepository: FileProcessingConfigRepository
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        if (bankOrTPPRepository.count() == 0L) {
            val bank = bankOrTPPRepository.save(BankOrTPP(code = "001", name = "Sample Bank", type = BankOrTPPType.BANK))
            seedFileProcessingConfigs(bank)
        }
    }

    private fun seedFileProcessingConfigs(bank: BankOrTPP) {
        val fileTypes = listOf(
            "ATM Terminal Data",
            "ATM Transaction Data",
            "Card Lifecycle",
            "E-Commerce Card Activity",
            "POS Terminal Data",
            "POS Transaction Data",
            "Transaction Volume"
        )

        fileTypes.forEach { fileType ->
            // Generate a regex-friendly version of the file type for the file name pattern
            val fileTypeForPattern = fileType.replace(" ", "")
            fileProcessingConfigRepository.save(
                FileProcessingConfig(
                    bankOrTPP = bank,
                    directoryPath = "sample-data/incoming",
                    fileNamePattern = "^${fileTypeForPattern}_${bank.code}_\\d{4}-\\d{2}-\\d{2}\\.csv$",
                    scheduleTime = "0 0 1 * * ?", // Daily at 1 AM
                    fileType = fileType
                )
            )
        }
    }
}
