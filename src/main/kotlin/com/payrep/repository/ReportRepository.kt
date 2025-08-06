package com.payrep.repository

import com.payrep.domain.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface ReportRepository : JpaRepository<Report, Long> {
    fun findByReportType(reportType: String): List<Report>
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<Report>
    fun findByInstitutionId(institutionId: String): List<Report>
}

@Repository
interface TransactionVolumeReportRepository : JpaRepository<TransactionVolume, Long> {
    @Query("SELECT t.channel_code as channel, SUM(t.txn_count) as totalTransactions FROM TransactionVolume t WHERE t.report_date BETWEEN :startDate AND :endDate GROUP BY t.channel_code ORDER BY totalTransactions DESC")
    fun getTotalTransactionsByChannel(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Map<String, Any>>
    
    @Query("SELECT t.channel_code as channel, SUM(t.txn_total_amount) as totalAmount FROM TransactionVolume t WHERE t.report_date BETWEEN :startDate AND :endDate GROUP BY t.channel_code ORDER BY totalAmount DESC")
    fun getTotalAmountByChannel(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Map<String, Any>>
    
    @Query("SELECT SUM(t.txn_success_count) as successfulTransactions, SUM(t.txn_failed_count) as failedTransactions FROM TransactionVolume t WHERE t.report_date BETWEEN :startDate AND :endDate")
    fun getSuccessFailureRatio(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): Map<String, Any>
}

@Repository
interface ATMTransactionReportRepository : JpaRepository<AtmTransactionData, Long> {
    @Query("SELECT COUNT(*) as totalTransactions FROM AtmTransactionData a WHERE a.report_date BETWEEN :startDate AND :endDate")
    fun getTotalTransactions(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): Long
    
    @Query("SELECT a.atm_id as atmId, COUNT(*) as transactionCount, SUM(a.total_loaded_amount) as totalAmount FROM AtmTransactionData a WHERE a.report_date BETWEEN :startDate AND :endDate GROUP BY a.atm_id ORDER BY COUNT(*) DESC")
    fun getTopATMsByTransactionVolume(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Map<String, Any>>
}

@Repository
interface POSTerminalReportRepository : JpaRepository<PosTerminalData, Long> {
    @Query("SELECT p.mcc_code as mcc, SUM(p.terminals_active_count) as activeTerminals FROM PosTerminalData p WHERE p.report_date BETWEEN :startDate AND :endDate GROUP BY p.mcc_code ORDER BY SUM(p.terminals_active_count) DESC")
    fun getActiveTerminalsByMCC(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Map<String, Any>>
    
    @Query("SELECT SUM(p.terminals_issued_count) as issuedCount, SUM(p.terminals_active_count) as activeCount, SUM(p.terminals_decom_count) as decomCount FROM PosTerminalData p WHERE p.report_date BETWEEN :startDate AND :endDate")
    fun getTerminalLifecycleStats(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): Map<String, Any>
}
