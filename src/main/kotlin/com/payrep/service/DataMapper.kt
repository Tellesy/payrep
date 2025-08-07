package com.payrep.service

import com.payrep.domain.*
import com.payrep.repository.BankOrTPPRepository
import com.payrep.repository.InstitutionIdConverterRepository
import org.springframework.stereotype.Component
import java.io.File
import java.io.FileWriter
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

private fun Any.asString(): String = this.toString()
private fun Any.asInt(): Int = this.toString().toInt()
private fun Any.asBigDecimal(): BigDecimal = this.toString().toBigDecimal()
private fun Any.asLocalDate(): LocalDate = LocalDate.parse(this.toString())

@Component
class DataMapper(
    private val bankOrTPPRepository: BankOrTPPRepository,
    private val institutionIdConverterRepository: InstitutionIdConverterRepository
) {
    
    private val logFileName = "debug-logs/institution-conversion-${LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm-ss"))}.log"
    
    private fun logToFileAndConsole(message: String) {
        val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"))
        val logMessage = "[$timestamp] $message"
        
        // Console log
        println(logMessage)
        
        // File log
        try {
            val logFile = File(logFileName)
            logFile.parentFile?.mkdirs()
            FileWriter(logFile, true).use { writer ->
                writer.appendLine(logMessage)
            }
        } catch (e: Exception) {
            println("ERROR: Failed to write to log file: ${e.message}")
        }
    }
    
    /**
     * Convert external institution ID to BankOrTPP entity using converter layer
     */
    private fun convertInstitutionId(externalInstitutionId: String?, processorCode: String): BankOrTPP? {
        try {
            println("=== INSTITUTION CONVERSION DEBUG ===")
            println("External ID: '$externalInstitutionId', Processor: '$processorCode'")
            
            if (externalInstitutionId.isNullOrBlank()) {
                println("ERROR: Institution ID is null or blank for processor: $processorCode")
                return null
            }
            
            // First, get the BankOrTPP entity for the processor to check if converter is enabled
            val processor = bankOrTPPRepository.findByCode(processorCode)
            if (processor == null) {
                println("ERROR: Processor BankOrTPP not found for code: $processorCode")
                return null
            }
            
            println("Processor found: ${processor.name}, useConverter: ${processor.useConverter}")
            
            val internalCode = if (processor.useConverter) {
                // Converter is enabled - try to find a mapping from external ID to internal code
                println("Converter enabled - looking for mapping...")
                val mapping = institutionIdConverterRepository.findBySourceInstitutionIdAndProcessorCode(
                    externalInstitutionId, processorCode
                )
                if (mapping != null) {
                    println("SUCCESS: Found converter mapping: '$externalInstitutionId' -> '${mapping.targetBankOrTppCode}'")
                    mapping.targetBankOrTppCode
                } else {
                    println("WARNING: No converter mapping found for '$externalInstitutionId' (processor: $processorCode)")
                    println("Available mappings for processor $processorCode:")
                    val allMappings = institutionIdConverterRepository.findByProcessorCodeAndIsActive(processorCode)
                    allMappings.forEach { m -> 
                        println("  - Source: '${m.sourceInstitutionId}' -> Target: '${m.targetBankOrTppCode}'")
                    }
                    println("Using external ID as-is: '$externalInstitutionId'")
                    externalInstitutionId
                }
            } else {
                // Converter is disabled - use external ID as-is (assume it's already internal code)
                println("Converter disabled - using external ID as-is: '$externalInstitutionId'")
                externalInstitutionId
            }
            
            println("Resolved internal code: '$internalCode'")
            
            // Look up the BankOrTPP entity using the resolved internal code
            val bankOrTPP = bankOrTPPRepository.findByCode(internalCode)
            if (bankOrTPP == null) {
                println("ERROR: BankOrTPP not found for internal code: '$internalCode'")
                println("Available BankOrTPP codes:")
                val allBanks = bankOrTPPRepository.findAll()
                allBanks.forEach { b -> println("  - Code: '${b.code}', Name: '${b.name}'")
                }
                return null
            }
            
            println("SUCCESS: Found BankOrTPP: ${bankOrTPP.name} (${bankOrTPP.code})")
            println("=== END CONVERSION DEBUG ===")
            return bankOrTPP
            
        } catch (e: Exception) {
            println("ERROR: Exception converting institution ID '$externalInstitutionId' for processor '$processorCode': ${e.message}")
            e.printStackTrace()
            return null
        }
    }
    
    fun Map<String, Any>.toAtmTerminalData(processorCode: String): AtmTerminalData? {
        val bankOrTPP = convertInstitutionId(this["institution_id"]!!.asString(), processorCode) ?: return null
        return AtmTerminalData(
            bankOrTPP = bankOrTPP,
            atmNewCount = this["atm_new_count"]!!.asInt(),
            atmActiveCount = this["atm_active_count"]!!.asInt(),
            atmInactiveCount = this["atm_inactive_count"]!!.asInt(),
            atmMaintenanceCount = this["atm_maintenance_count"]!!.asInt(),
            atmLocationType = this["atm_location_type"]!!.asString(),
            atmTotalCount = this["atm_total_count"]!!.asInt(),
            reportDate = this["report_date"]!!.asLocalDate()
        )
    }
    
    fun Map<String, Any>.toAtmTransactionData(processorCode: String): AtmTransactionData? {
        val bankOrTPP = convertInstitutionId(this["institution_id"]!!.asString(), processorCode) ?: return null
        return AtmTransactionData(
            atmId = this["atm_id"]!!.asString(),
            bankOrTPP = bankOrTPP,
            branchName = this["branch_name"]!!.asString(),
            txnSuccessCount = this["txn_success_count"]!!.asInt(),
            txnFailedCount = this["txn_failed_count"]!!.asInt(),
            totalLoadedAmount = this["total_loaded_amount"]!!.asBigDecimal(),
            transactionCategory = this["transaction_category"]!!.asString(),
            reportDate = this["report_date"]!!.asLocalDate()
        )
    }
    
    fun Map<String, Any>.toCardLifecycle(processorCode: String): CardLifecycle? {
        val bankOrTPP = convertInstitutionId(this["institution_id"]!!.asString(), processorCode) ?: return null
        return CardLifecycle(
            bankOrTPP = bankOrTPP,
            cardProductCode = this["card_product_code"]!!.asString(),
            cardProductType = this["card_product_type"]!!.asString(),
            cardTechnologyType = this["card_technology_type"]!!.asString(),
            cardsIssuedCount = this["cards_issued_count"]!!.asInt(),
            cardsDeliveredCount = this["cards_delivered_count"]!!.asInt(),
            cardsActivatedCount = this["cards_activated_count"]!!.asInt(),
            cardsRenewedCount = this["cards_renewed_count"]!!.asInt(),
            cardsReissuedCount = this["cards_reissued_count"]!!.asInt(),
            cardsDeactivatedCount = this["cards_deactivated_count"]!!.asInt(),
            cardsActivityCount = this["cards_activity_count"]!!.asInt(),
            reportDate = this["report_date"]!!.asLocalDate()
        )
    }

    fun Map<String, Any>.toECommerceCardActivity(processorCode: String): ECommerceCardActivity? {
        val bankOrTPP = convertInstitutionId(this["institution_id"]!!.asString(), processorCode) ?: return null
        return ECommerceCardActivity(
            bankOrTPP = bankOrTPP,
            cardProductCode = this["card_product_code"]!!.asString(),
            ecommerceEnabledCards = this["ecommerce_enabled_cards"]!!.asInt(),
            ecommerceActivityCards = this["ecommerce_activity_cards"]!!.asInt(),
            reportDate = this["report_date"]!!.asLocalDate()
        )
    }

    fun Map<String, Any>.toPosTerminalData(processorCode: String): PosTerminalData? {
        val bankOrTPP = convertInstitutionId(this["institution_id"]!!.asString(), processorCode) ?: return null
        return PosTerminalData(
            bankOrTPP = bankOrTPP,
            mccCode = this["mcc_code"]!!.asString(),
            mccDescription = this["mcc_description"]!!.asString(),
            terminalsIssuedCount = this["terminals_issued_count"]!!.asInt(),
            terminalsDeliveredCount = this["terminals_delivered_count"]!!.asInt(),
            terminalsReissuedCount = this["terminals_reissued_count"]!!.asInt(),
            terminalsDecomCount = this["terminals_decom_count"]!!.asInt(),
            terminalsActiveCount = this["terminals_active_count"]!!.asInt(),
            terminalsActivityCount = this["terminals_activity_count"]!!.asInt(),
            terminalsTotalCount = this["terminals_total_count"]!!.asInt(),
            reportDate = this["report_date"]!!.asLocalDate()
        )
    }

    fun Map<String, Any>.toPosTransactionData(processorCode: String): PosTransactionData? {
        val bankOrTPP = convertInstitutionId(this["institution_id"]!!.asString(), processorCode) ?: return null
        return PosTransactionData(
            bankOrTPP = bankOrTPP,
            txnSuccessCount = this["txn_success_count"]!!.asInt(),
            txnFailedCount = this["txn_failed_count"]!!.asInt(),
            totalTransactionAmount = this["total_transaction_amount"]!!.asBigDecimal(),
            transactionCategory = this["transaction_category"]!!.asString(),
            reportDate = this["report_date"]!!.asLocalDate()
        )
    }

    fun Map<String, Any>.toTransactionVolume(processorCode: String, fileName: String): TransactionVolume? {
        val bankOrTPP = convertInstitutionId(this["institution_id"]!!.asString(), processorCode) ?: return null
        return TransactionVolume(
            bankOrTPP = bankOrTPP,
            channelCode = this["channel_code"]!!.asString(),
            transactionTypeCode = this["transaction_type_code"]!!.asString(),
            transactionTypeDesc = this["transaction_type_desc"]!!.asString(),
            mccCode = this["mcc_code"]!!.asString(),
            mccDescription = this["mcc_description"]!!.asString(),
            txnCount = this["txn_count"]!!.asInt(),
            txnTotalAmount = this["txn_total_amount"]!!.asBigDecimal(),
            txnSuccessCount = this["txn_success_count"]!!.asInt(),
            txnFailedCount = this["txn_failed_count"]!!.asInt(),
            transactionCategory = this["transaction_category"]!!.asString(),
            reportDate = this["report_date"]!!.asLocalDate(),
            fileName = fileName
        )
    }
}
