package com.payrep.service

import com.payrep.domain.ColumnMapping
import com.payrep.domain.FileProcessingConfig
import com.payrep.repository.ColumnMappingRepository
import com.payrep.repository.FileProcessingConfigRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Order(3)
class ColumnMappingSeederService(
    private val fileProcessingConfigRepository: FileProcessingConfigRepository,
    private val columnMappingRepository: ColumnMappingRepository
) : CommandLineRunner {

    private val logger = LoggerFactory.getLogger(ColumnMappingSeederService::class.java)

    @Transactional
    override fun run(vararg args: String?) {
        logger.info("Starting ColumnMappingSeederService...")
        // Force recreation of column mappings for comprehensive automation
        logger.info("Clearing existing column mappings to ensure fresh, accurate mappings...")
        columnMappingRepository.deleteAll()
        logger.info("Existing column mappings cleared")

        logger.info("Seeding column mappings for all file processing configurations...")
        
        val allConfigs = fileProcessingConfigRepository.findAll()
        logger.info("Found ${allConfigs.size} file processing configurations to map")

        var totalMappingsCreated = 0

        allConfigs.forEach { config ->
            logger.info("Creating column mappings for config ${config.id}: ${config.bankOrTPP.code} - ${config.fileNamePattern}")
            
            val mappings = createColumnMappingsForConfig(config)
            if (mappings.isNotEmpty()) {
                val savedMappings = columnMappingRepository.saveAll(mappings)
                logger.info("Created ${savedMappings.size} column mappings for config ${config.id}")
                totalMappingsCreated += savedMappings.size
            } else {
                logger.warn("No mappings created for config ${config.id} - unrecognized file pattern: ${config.fileNamePattern}")
            }
        }

        logger.info("ColumnMappingSeederService completed. Created $totalMappingsCreated total column mappings for ${allConfigs.size} configurations.")
    }

    private fun createColumnMappingsForConfig(config: FileProcessingConfig): List<ColumnMapping> {
        val mappings = mutableListOf<ColumnMapping>()
        
        when {
            config.fileNamePattern.contains("atm_terminal_data", ignoreCase = true) -> {
                mappings.addAll(createATMTerminalMappings(config))
            }
            config.fileNamePattern.contains("atm_transaction_data", ignoreCase = true) -> {
                mappings.addAll(createATMTransactionMappings(config))
            }
            config.fileNamePattern.contains("pos_terminal_data", ignoreCase = true) -> {
                mappings.addAll(createPOSTerminalMappings(config))
            }
            config.fileNamePattern.contains("pos_transaction_data", ignoreCase = true) -> {
                mappings.addAll(createPOSTransactionMappings(config))
            }
            config.fileNamePattern.contains("card_lifecycle", ignoreCase = true) -> {
                mappings.addAll(createCardLifecycleMappings(config))
            }
            config.fileNamePattern.contains("ecommerce_card_activity", ignoreCase = true) -> {
                mappings.addAll(createECommerceCardMappings(config))
            }
            config.fileNamePattern.contains("transaction_volume", ignoreCase = true) -> {
                mappings.addAll(createTransactionVolumeMappings(config))
            }
            else -> {
                logger.warn("Unknown file pattern for config ${config.id}: ${config.fileNamePattern}")
            }
        }
        
        return mappings
    }

    private fun createATMTerminalMappings(config: FileProcessingConfig): List<ColumnMapping> {
        return listOf(
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "atm_id",
                entityType = "AtmTerminalData",
                fieldName = "atmId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "institution_id",
                entityType = "AtmTerminalData",
                fieldName = "institutionId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "location",
                entityType = "AtmTerminalData",
                fieldName = "location",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "status",
                entityType = "AtmTerminalData",
                fieldName = "status",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "last_maintenance_date",
                entityType = "AtmTerminalData",
                fieldName = "lastMaintenanceDate",
                transformation = "date:yyyy-MM-dd"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "uptime_percentage",
                entityType = "AtmTerminalData",
                fieldName = "uptimePercentage",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "report_date",
                entityType = "AtmTerminalData",
                fieldName = "reportDate",
                transformation = "date:yyyy-MM-dd"
            )
        )
    }

    private fun createATMTransactionMappings(config: FileProcessingConfig): List<ColumnMapping> {
        return listOf(
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "transaction_id",
                entityType = "AtmTransactionData",
                fieldName = "transactionId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "atm_id",
                entityType = "AtmTransactionData",
                fieldName = "atmId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "institution_id",
                entityType = "AtmTransactionData",
                fieldName = "institutionId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "transaction_type",
                entityType = "AtmTransactionData",
                fieldName = "transactionType",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "amount",
                entityType = "AtmTransactionData",
                fieldName = "amount",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "status",
                entityType = "AtmTransactionData",
                fieldName = "status",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "transaction_date",
                entityType = "AtmTransactionData",
                fieldName = "transactionDate",
                transformation = "date:yyyy-MM-dd"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "report_date",
                entityType = "AtmTransactionData",
                fieldName = "reportDate",
                transformation = "date:yyyy-MM-dd"
            )
        )
    }

    private fun createPOSTerminalMappings(config: FileProcessingConfig): List<ColumnMapping> {
        return listOf(
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "terminal_id",
                entityType = "PosTerminalData",
                fieldName = "terminalId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "institution_id",
                entityType = "PosTerminalData",
                fieldName = "institutionId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "merchant_id",
                entityType = "PosTerminalData",
                fieldName = "merchantId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "location",
                entityType = "PosTerminalData",
                fieldName = "location",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "status",
                entityType = "PosTerminalData",
                fieldName = "status",
                transformation = "trim"
            ),
            // Note: TPP 901 POS terminal data doesn't have last_transaction_date column
            // Removed this mapping to match actual data structure
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "terminals_delivered_count",
                entityType = "PosTerminalData",
                fieldName = "terminalsDeliveredCount",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "terminals_active_count",
                entityType = "PosTerminalData",
                fieldName = "terminalsActiveCount",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "uptime_percentage",
                entityType = "PosTerminalData",
                fieldName = "uptimePercentage",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "report_date",
                entityType = "PosTerminalData",
                fieldName = "reportDate",
                transformation = "date:yyyy-MM-dd"
            )
        )
    }

    private fun createPOSTransactionMappings(config: FileProcessingConfig): List<ColumnMapping> {
        return listOf(
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "transaction_id",
                entityType = "PosTransactionData",
                fieldName = "transactionId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "terminal_id",
                entityType = "PosTransactionData",
                fieldName = "terminalId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "institution_id",
                entityType = "PosTransactionData",
                fieldName = "institutionId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "amount",
                entityType = "PosTransactionData",
                fieldName = "amount",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "status",
                entityType = "PosTransactionData",
                fieldName = "status",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "transaction_date",
                entityType = "PosTransactionData",
                fieldName = "transactionDate",
                transformation = "date:yyyy-MM-dd"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "report_date",
                entityType = "PosTransactionData",
                fieldName = "reportDate",
                transformation = "date:yyyy-MM-dd"
            )
        )
    }

    private fun createCardLifecycleMappings(config: FileProcessingConfig): List<ColumnMapping> {
        return listOf(
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "card_id",
                entityType = "CardLifecycle",
                fieldName = "cardId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "institution_id",
                entityType = "CardLifecycle",
                fieldName = "institutionId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "card_type",
                entityType = "CardLifecycle",
                fieldName = "cardType",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "status",
                entityType = "CardLifecycle",
                fieldName = "status",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "issue_date",
                entityType = "CardLifecycle",
                fieldName = "issueDate",
                transformation = "date:yyyy-MM-dd"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "expiry_date",
                entityType = "CardLifecycle",
                fieldName = "expiryDate",
                transformation = "date:yyyy-MM-dd"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "activation_date",
                entityType = "CardLifecycle",
                fieldName = "activationDate",
                transformation = "date:yyyy-MM-dd"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "report_date",
                entityType = "CardLifecycle",
                fieldName = "reportDate",
                transformation = "date:yyyy-MM-dd"
            )
        )
    }

    private fun createECommerceCardMappings(config: FileProcessingConfig): List<ColumnMapping> {
        return listOf(
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "card_id",
                entityType = "ECommerceCardActivity",
                fieldName = "cardId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "institution_id",
                entityType = "ECommerceCardActivity",
                fieldName = "institutionId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "transaction_count",
                entityType = "ECommerceCardActivity",
                fieldName = "transactionCount",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "total_volume",
                entityType = "ECommerceCardActivity",
                fieldName = "totalVolume",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "status",
                entityType = "ECommerceCardActivity",
                fieldName = "status",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "last_activity_date",
                entityType = "ECommerceCardActivity",
                fieldName = "lastActivityDate",
                transformation = "date:yyyy-MM-dd"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "report_date",
                entityType = "ECommerceCardActivity",
                fieldName = "reportDate",
                transformation = "date:yyyy-MM-dd"
            )
        )
    }

    private fun createTransactionVolumeMappings(config: FileProcessingConfig): List<ColumnMapping> {
        return listOf(
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "institution_id",
                entityType = "TransactionVolume",
                fieldName = "institutionId",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "transaction_type",
                entityType = "TransactionVolume",
                fieldName = "transactionType",
                transformation = "trim"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "transaction_count",
                entityType = "TransactionVolume",
                fieldName = "transactionCount",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "total_amount",
                entityType = "TransactionVolume",
                fieldName = "totalAmount",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "average_amount",
                entityType = "TransactionVolume",
                fieldName = "averageAmount",
                transformation = "number"
            ),
            ColumnMapping(
                fileProcessingConfig = config,
                columnName = "report_date",
                entityType = "TransactionVolume",
                fieldName = "reportDate",
                transformation = "date:yyyy-MM-dd"
            )
        )
    }
}
