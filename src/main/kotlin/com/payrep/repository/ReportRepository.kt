package com.payrep.repository

import com.payrep.domain.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface ReportRepository : JpaRepository<Report, Long> {
    fun findByReportType(reportType: String): List<Report>
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<Report>
    fun findByInstitutionId(institutionId: String): List<Report>
}

@Repository
interface TransactionVolumeReportRepository : JpaRepository<TransactionVolumeReport, Long> {
    fun findByChannelCode(channelCode: String): List<TransactionVolumeReport>
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<TransactionVolumeReport>
    
    @Query("SELECT SUM(t.txnCount) FROM TransactionVolumeReport t WHERE t.reportDate BETWEEN :startDate AND :endDate GROUP BY t.channelCode")
    fun getTotalTransactionsByChannel(startDate: LocalDate, endDate: LocalDate): Map<String, Long>
    
    @Query("SELECT SUM(t.txnTotalAmount) FROM TransactionVolumeReport t WHERE t.reportDate BETWEEN :startDate AND :endDate GROUP BY t.channelCode")
    fun getTotalAmountByChannel(startDate: LocalDate, endDate: LocalDate): Map<String, Double>
    
    @Query("SELECT SUM(t.txnSuccessCount) as successCount, SUM(t.txnFailedCount) as failedCount FROM TransactionVolumeReport t WHERE t.reportDate BETWEEN :startDate AND :endDate")
    fun getSuccessFailureRatio(startDate: LocalDate, endDate: LocalDate): Map<String, Long>
}

@Repository
interface ATMTransactionReportRepository : JpaRepository<ATMTransactionReport, Long> {
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<ATMTransactionReport>
    
    @Query("SELECT SUM(a.txnSuccessCount) as successCount, SUM(a.txnFailedCount) as failedCount FROM ATMTransactionReport a WHERE a.reportDate BETWEEN :startDate AND :endDate")
    fun getSuccessFailureRatio(startDate: LocalDate, endDate: LocalDate): Map<String, Long>
    
    @Query("SELECT a.atmId, SUM(a.txnSuccessCount + a.txnFailedCount) as totalCount FROM ATMTransactionReport a WHERE a.reportDate BETWEEN :startDate AND :endDate GROUP BY a.atmId ORDER BY totalCount DESC")
    fun getTopATMsByTransactionVolume(startDate: LocalDate, endDate: LocalDate): List<Map<String, Any>>
}

@Repository
interface POSTerminalReportRepository : JpaRepository<POSTerminalReport, Long> {
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<POSTerminalReport>
    
    @Query("SELECT p.mccDescription, SUM(p.terminalsActiveCount) as activeCount FROM POSTerminalReport p WHERE p.reportDate BETWEEN :startDate AND :endDate GROUP BY p.mccDescription ORDER BY activeCount DESC")
    fun getActiveTerminalsByMCC(startDate: LocalDate, endDate: LocalDate): List<Map<String, Any>>
    
    @Query("SELECT SUM(p.terminalsIssuedCount) as issuedCount, SUM(p.terminalsDecomCount) as decomCount FROM POSTerminalReport p WHERE p.reportDate BETWEEN :startDate AND :endDate")
    fun getTerminalLifecycleStats(startDate: LocalDate, endDate: LocalDate): Map<String, Long>
}
