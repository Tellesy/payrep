package com.payrep.config

import com.payrep.entities.BankOrTPP
import com.payrep.entities.FileProcessingConfig
import com.payrep.repositories.BankOrTPPRepository
import com.payrep.repositories.FileProcessingConfigRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import java.time.LocalTime

@Component
class DataLoader(
    private val bankOrTppRepository: BankOrTPPRepository,
    private val fileProcessingConfigRepository: FileProcessingConfigRepository
) : CommandLineRunner {

    private val exampleBanks = listOf(
        BankOrTPP(
            code = "001",
            name = "National Commercial Bank",
            type = BankOrTPP.Type.BANK
        ),
        BankOrTPP(
            code = "002",
            name = "Libyan Foreign Bank",
            type = BankOrTPP.Type.BANK
        )
    )

    private val exampleTPPs = listOf(
        BankOrTPP(
            code = "101",
            name = "Libyan Payment Network",
            type = BankOrTPP.Type.TPP
        ),
        BankOrTPP(
            code = "102",
            name = "Libyan Payment Gateway",
            type = BankOrTPP.Type.TPP
        )
    )

    private val exampleConfigs = listOf(
        FileProcessingConfig(
            bankOrTPP = exampleBanks[0],
            directoryPath = "/data/banks/001/",
            filenamePattern = "NATCOM_.*\.csv",
            scheduleTime = LocalTime.of(0, 15),
            fileFormat = FileProcessingConfig.FileFormat.CSV
        ),
        FileProcessingConfig(
            bankOrTPP = exampleTPPs[0],
            directoryPath = "/data/tpps/101/",
            filenamePattern = "LPN_.*\.csv",
            scheduleTime = LocalTime.of(0, 30),
            fileFormat = FileProcessingConfig.FileFormat.CSV
        )
    )

    override fun run(vararg args: String?) {
        // Save banks
        val savedBanks = bankOrTppRepository.saveAll(exampleBanks)
        val savedTPPs = bankOrTppRepository.saveAll(exampleTPPs)

        // Update configs with actual saved entities
        val configs = exampleConfigs.map { config ->
            config.bankOrTPP = when (config.bankOrTPP.type) {
                BankOrTPP.Type.BANK -> savedBanks.first { it.code == config.bankOrTPP.code }
                BankOrTPP.Type.TPP -> savedTPPs.first { it.code == config.bankOrTPP.code }
            }
            config
        }

        // Save configs
        fileProcessingConfigRepository.saveAll(configs)
    }
}
