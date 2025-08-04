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
                        
                        val report = TransactionVolumeReport(
                            institutionId = fields[0],
                            institutionName = fields[1],
                            channelCode = fields[2],
                            transactionTypeCode = fields[3],
                            transactionTypeDesc = fields[4],
                            mccCode = fields[5].takeIf { it.isNotBlank() },
                            mccDescription = fields[6].takeIf { it.isNotBlank() },
                            txnCount = fields[7].toIntOrNull() ?: 0,
                            txnTotalAmount = fields[8].toDoubleOrNull() ?: 0.0,
                            txnSuccessCount = fields[9].toIntOrNull() ?: 0,
                            txnFailedCount = fields[10].toIntOrNull() ?: 0,
                            transactionCategory = fields[11].takeIf { it.isNotBlank() },
                            reportDate = parseReportDate(fields[12]),
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
                        
                        val report = ATMTransactionReport(
                            atmId = fields[0],
                            institutionId = fields[1],
                            institutionName = fields[2],
                            branchName = fields[3],
                            txnSuccessCount = fields[4].toIntOrNull() ?: 0,
                            txnFailedCount = fields[5].toIntOrNull() ?: 0,
                            totalLoadedAmount = fields[6].toDoubleOrNull() ?: 0.0,
                            transactionCategory = fields[7].takeIf { it.isNotBlank() },
                            reportDate = parseReportDate(fields[8]),
                            fileName = file.name
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
                        
                        val report = POSTerminalReport(
                            institutionId = fields[0],
                            institutionName = fields[1],
                            mccCode = fields[2].takeIf { it.isNotBlank() },
                            mccDescription = fields[3].takeIf { it.isNotBlank() },
                            terminalsIssuedCount = fields[4].toIntOrNull() ?: 0,
                            terminalsDeliveredCount = fields[5].toIntOrNull() ?: 0,
                            terminalsReissuedCount = fields[6].toIntOrNull() ?: 0,
                            terminalsDecomCount = fields[7].toIntOrNull() ?: 0,
                            terminalsActiveCount = fields[8].toIntOrNull() ?: 0,
                            terminalsActivityCount = fields[9].toIntOrNull() ?: 0,
                            terminalsTotalCount = fields[10].toIntOrNull() ?: 0,
                            reportDate = parseReportDate(fields[11]),
                            fileName = file.name
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
    
    fun getATMTransactionChartData(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        val successFailureRatio = atmTransactionReportRepository.getSuccessFailureRatio(startDate, endDate)
        val topATMs = atmTransactionReportRepository.getTopATMsByTransactionVolume(startDate, endDate)
        
        return mapOf(
            "successFailureRatio" to successFailureRatio,
            "topATMs" to topATMs
        )
    }
    
    fun getPOSTerminalChartData(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        val activeTerminalsByMCC = posTerminalReportRepository.getActiveTerminalsByMCC(startDate, endDate)
        val terminalLifecycle = posTerminalReportRepository.getTerminalLifecycleStats(startDate, endDate)
        
        return mapOf(
            "activeTerminalsByMCC" to activeTerminalsByMCC,
            "terminalLifecycle" to terminalLifecycle
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
