package com.payrep.service

import org.springframework.stereotype.Service
import java.time.LocalDate
import com.payrep.repository.*

@Service
class ReportServiceSimple(
    private val transactionVolumeRepository: TransactionVolumeRepository,
    private val atmTransactionDataRepository: AtmTransactionDataRepository,
    private val atmTerminalDataRepository: AtmTerminalDataRepository,
    private val posTerminalDataRepository: PosTerminalDataRepository,
    private val posTransactionDataRepository: PosTransactionDataRepository,
    private val cardLifecycleRepository: CardLifecycleRepository,
    private val eCommerceCardActivityRepository: ECommerceCardActivityRepository
) {

    fun processReportsFromDirectory(directory: String): Int {
        // Placeholder implementation - return a mock count
        return 42
    }

    fun getTransactionVolumeChartData(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        // Use proper database query with WHERE clause instead of findAll() + filter
        val data = transactionVolumeRepository.findByReportDateBetween(startDate, endDate)
        println("DEBUG: Transaction volume query returned ${data.size} records for date range ${startDate} to ${endDate}")
        
        val totalVolume = data.sumOf { it.txn_total_amount.toDouble() }
        val totalTransactions = data.size
        
        return mapOf(
            "totalVolume" to totalVolume,
            "totalTransactions" to totalTransactions,
            "chartData" to data.map { mapOf(
                "date" to it.report_date.toString(),
                "institution" to it.institution_name,
                "volume" to it.txn_total_amount.toDouble()
            )}
        )
    }
    
    fun getATMTransactionAnalytics(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        // Use proper database query with WHERE clause instead of findAll() + filter
        val data = atmTransactionDataRepository.findByReportDateBetween(startDate, endDate)
        println("DEBUG: ATM transaction query returned ${data.size} records for date range ${startDate} to ${endDate}")
        
        val totalSuccessCount = data.sumOf { it.txn_success_count }
        val totalFailedCount = data.sumOf { it.txn_failed_count }
        val totalAmount = data.sumOf { it.total_loaded_amount.toDouble() }
        
        return mapOf(
            "totalSuccessCount" to totalSuccessCount,
            "totalFailedCount" to totalFailedCount,
            "totalAmount" to totalAmount,
            "chartData" to data.map { mapOf(
                "date" to it.report_date.toString(),
                "institution" to it.institution_name,
                "successCount" to it.txn_success_count,
                "failedCount" to it.txn_failed_count
            )}
        )
    }
    
    fun getPOSTerminalAnalytics(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        // Use proper database query with WHERE clause instead of findAll() + filter
        val data = posTerminalDataRepository.findByReportDateBetween(startDate, endDate)
        println("DEBUG: POS terminal query returned ${data.size} records for date range ${startDate} to ${endDate}")
        
        val totalTerminals = data.sumOf { it.terminals_total_count }
        val activeTerminals = data.sumOf { it.terminals_active_count }
        
        return mapOf(
            "totalTerminals" to totalTerminals,
            "activeTerminals" to activeTerminals,
            "chartData" to data.map { mapOf(
                "date" to it.report_date.toString(),
                "institution" to it.institution_name,
                "totalCount" to it.terminals_total_count,
                "activeCount" to it.terminals_active_count
            )}
        )
    }
    
    fun getATMTerminalAnalytics(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        // Use proper database query with WHERE clause instead of findAll() + filter
        val data = atmTerminalDataRepository.findByReportDateBetween(startDate, endDate)
        println("DEBUG: ATM terminal query returned ${data.size} records for date range ${startDate} to ${endDate}")
        
        val totalTerminals = data.sumOf { it.atm_total_count }
        val activeTerminals = data.sumOf { it.atm_active_count }
        
        return mapOf(
            "totalTerminals" to totalTerminals,
            "activeTerminals" to activeTerminals,
            "chartData" to data.map { mapOf(
                "date" to it.report_date.toString(),
                "institution" to it.institution_name,
                "totalCount" to it.atm_total_count,
                "activeCount" to it.atm_active_count
            )}
        )
    }
    
    fun getPOSTransactionAnalytics(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        // Use proper database query with WHERE clause instead of findAll() + filter
        val data = posTransactionDataRepository.findByReportDateBetween(startDate, endDate)
        println("DEBUG: POS transaction query returned ${data.size} records for date range ${startDate} to ${endDate}")
        
        val totalSuccessTransactions = data.sumOf { it.txn_success_count }
        val totalFailedTransactions = data.sumOf { it.txn_failed_count }
        val totalAmount = data.sumOf { it.total_transaction_amount.toDouble() }
        
        return mapOf(
            "totalSuccessTransactions" to totalSuccessTransactions,
            "totalFailedTransactions" to totalFailedTransactions,
            "totalAmount" to totalAmount,
            "chartData" to data.map { mapOf(
                "date" to it.report_date.toString(),
                "bank" to it.bank_name,
                "successCount" to it.txn_success_count,
                "failedCount" to it.txn_failed_count
            )}
        )
    }
    
    fun getCardLifecycleAnalytics(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        // Use proper database query with WHERE clause instead of findAll() + filter
        val data = cardLifecycleRepository.findByReportDateBetween(startDate, endDate)
        println("DEBUG: Card lifecycle query returned ${data.size} records for date range ${startDate} to ${endDate}")
        
        val totalIssued = data.sumOf { it.cards_issued_count }
        val totalActivated = data.sumOf { it.cards_activated_count }
        
        return mapOf(
            "totalIssued" to totalIssued,
            "totalActivated" to totalActivated,
            "chartData" to data.map { mapOf(
                "date" to it.report_date.toString(),
                "institution" to it.institution_name,
                "issued" to it.cards_issued_count,
                "activated" to it.cards_activated_count
            )}
        )
    }
    
    fun getECommerceActivityAnalytics(startDate: LocalDate, endDate: LocalDate): Map<String, Any> {
        // Use proper database query with WHERE clause instead of findAll() + filter
        val data = eCommerceCardActivityRepository.findByReportDateBetween(startDate, endDate)
        println("DEBUG: E-commerce activity query returned ${data.size} records for date range ${startDate} to ${endDate}")
        
        val totalEnabledCards = data.sumOf { it.ecommerce_enabled_cards }
        val totalActiveCards = data.sumOf { it.ecommerce_activity_cards }
        
        return mapOf(
            "totalEnabledCards" to totalEnabledCards,
            "totalActiveCards" to totalActiveCards,
            "chartData" to data.map { mapOf(
                "date" to it.report_date.toString(),
                "institution" to it.institution_name,
                "enabledCards" to it.ecommerce_enabled_cards,
                "activeCards" to it.ecommerce_activity_cards
            )}
        )
    }
}
