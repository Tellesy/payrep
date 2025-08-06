package com.payrep.service

import com.payrep.domain.*
import com.payrep.repository.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.BufferedReader
import java.io.File
import java.io.FileReader
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class ReportService(
    private val reportRepository: ReportRepository,
    private val transactionVolumeReportRepository: TransactionVolumeReportRepository,
    private val atmTransactionReportRepository: ATMTransactionReportRepository,
    private val posTerminalReportRepository: POSTerminalReportRepository
) {
    private val logger = LoggerFactory.getLogger(ReportService::class.java)
    
    @Transactional
    fun processReport(file: File): Boolean {
        logger.info("Processing report file: {}", file.name)
        
        return when {
            file.name.startsWith("TransactionVolume") -> processTransactionVolumeReport(file)
            file.name.startsWith("ATMTransactionData") -> processATMTransactionReport(file)
            file.name.startsWith("POSTerminalData") -> processPOSTerminalReport(file)
            else -> {
                logger.warn("Unsupported report type: {}", file.name)
                false
            }
        }
    }
    
    private fun processTransactionVolumeReport(file: File): Boolean {
        try {
            BufferedReader(FileReader(file)).use { reader ->
                // Skip header
                val header = reader.readLine()
                
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    line?.let { csvLine ->
                        val fields = csvLine.split(",")
                        
                        // Validate minimum field count
                        if (fields.size < 12) {
                            logger.error("Invalid CSV format in file {}", file.name)
                            return false
                        }
                        
                        val report = TransactionVolume(
                            institution_id = fields[0],
                            institution_name = fields[1],
                            channel_code = fields[2],
                            transaction_type_code = fields[3],
                            transaction_type_desc = fields[4],
                            mcc_code = fields[5].takeIf { it.isNotBlank() } ?: "",
                            mcc_description = fields[6].takeIf { it.isNotBlank() } ?: "",
                            txn_count = fields[7].toIntOrNull() ?: 0,
                            txn_total_amount = java.math.BigDecimal(fields[8].toDoubleOrNull() ?: 0.0),
                            txn_success_count = fields[9].toIntOrNull() ?: 0,
                            txn_failed_count = fields[10].toIntOrNull() ?: 0,
                            transaction_category = fields[11].takeIf { it.isNotBlank() } ?: "",
                            report_date = parseReportDate(fields[12]),
                            fileName = file.name
                        )
                        
                        transactionVolumeReportRepository.save(report)
                    }
                }
            }
            
            return true
        } catch (e: Exception) {
            logger.error("Error processing Transaction Volume report: {}", e.message, e)
            return false
        }
    }
    
    private fun processATMTransactionReport(file: File): Boolean {
        try {
            BufferedReader(FileReader(file)).use { reader ->
                // Skip header
                val header = reader.readLine()
                
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    line?.let { csvLine ->
                        val fields = csvLine.split(",")
                        
                        // Validate minimum field count
                        if (fields.size < 8) {
                            logger.error("Invalid CSV format in file {}", file.name)
                            return false
                        }
                        
                        val report = AtmTransactionData(
                            atm_id = fields[0],
                            institution_id = fields[1],
                            institution_name = fields[2],
                            branch_name = fields[3],
                            txn_success_count = fields[4].toIntOrNull() ?: 0,
                            txn_failed_count = fields[5].toIntOrNull() ?: 0,
                            total_loaded_amount = java.math.BigDecimal(fields[6].toDoubleOrNull() ?: 0.0),
                            transaction_category = fields[7].takeIf { it.isNotBlank() } ?: "",
                            report_date = parseReportDate(fields[8])
                        )
                        
                        atmTransactionReportRepository.save(report)
                    }
                }
            }
            
            return true
        } catch (e: Exception) {
            logger.error("Error processing ATM Transaction report: {}", e.message, e)
            return false
        }
    }
    
    private fun processPOSTerminalReport(file: File): Boolean {
        try {
            BufferedReader(FileReader(file)).use { reader ->
                // Skip header
                val header = reader.readLine()
                
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    line?.let { csvLine ->
                        val fields = csvLine.split(",")
                        
                        // Validate minimum field count
                        if (fields.size < 11) {
                            logger.error("Invalid CSV format in file {}", file.name)
                            return false
                        }
                        
                        val report = PosTerminalData(
                            institution_id = fields[0],
                            institution_name = fields[1],
                            mcc_code = fields[2].takeIf { it.isNotBlank() } ?: "",
                            mcc_description = fields[3].takeIf { it.isNotBlank() } ?: "",
                            terminals_issued_count = fields[4].toIntOrNull() ?: 0,
                            terminals_delivered_count = fields[5].toIntOrNull() ?: 0,
                            terminals_reissued_count = fields[6].toIntOrNull() ?: 0,
                            terminals_decom_count = fields[7].toIntOrNull() ?: 0,
                            terminals_active_count = fields[8].toIntOrNull() ?: 0,
                            terminals_activity_count = fields[9].toIntOrNull() ?: 0,
                            terminals_total_count = fields[10].toIntOrNull() ?: 0,
                            report_date = parseReportDate(fields[11])
                        )
                        
                        posTerminalReportRepository.save(report)
                    }
                }
            }
            
            return true
        } catch (e: Exception) {
            logger.error("Error processing POS Terminal report: {}", e.message, e)
            return false
        }
    }
    
    private fun parseReportDate(dateStr: String): LocalDate {
        return try {
            LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE)
        } catch (e: Exception) {
            LocalDate.now()
        }
    }
    
    fun getTransactionVolumeChartData(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        val channelTransactions = transactionVolumeReportRepository.getTotalTransactionsByChannel(startDate, endDate)
        val channelAmounts = transactionVolumeReportRepository.getTotalAmountByChannel(startDate, endDate)
        val successFailureRatio = transactionVolumeReportRepository.getSuccessFailureRatio(startDate, endDate)
        
        return mapOf(
            "channelTransactions" to channelTransactions,
            "channelAmounts" to channelAmounts,
            "successFailureRatio" to successFailureRatio
        )
    }
    
    fun getATMTransactionAnalytics(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        val totalTransactions = atmTransactionReportRepository.getTotalTransactions(startDate, endDate)
        val topATMs = atmTransactionReportRepository.getTopATMsByTransactionVolume(startDate, endDate)
        
        return mapOf(
            "totalTransactions" to totalTransactions,
            "topATMs" to topATMs
        )
    }
    
    fun getPOSTerminalAnalytics(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        val activeTerminalsByMCC = posTerminalReportRepository.getActiveTerminalsByMCC(startDate, endDate)
        val lifecycleStats = posTerminalReportRepository.getTerminalLifecycleStats(startDate, endDate)
        
        return mapOf(
            "activeTerminalsByMCC" to activeTerminalsByMCC,
            "lifecycleStats" to lifecycleStats
        )
    }
    
    fun processReportsFromDirectory(directory: String): Int {
        var processedCount = 0
        
        try {
            val dir = File(directory)
            if (!dir.exists() || !dir.isDirectory) {
                logger.error("Directory does not exist: {}", directory)
                return 0
            }
            
            dir.listFiles { file -> file.isFile && file.name.endsWith(".csv") }?.forEach { file ->
                if (processReport(file)) {
                    processedCount++
                }
            }
        } catch (e: Exception) {
            logger.error("Error processing reports from directory: {}", e.message, e)
        }
        
        return processedCount
    }
}
