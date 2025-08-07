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
    @Query("SELECT t.channelCode as channel, SUM(t.txnCount) as totalTransactions FROM TransactionVolume t WHERE t.reportDate BETWEEN :startDate AND :endDate GROUP BY t.channelCode ORDER BY totalTransactions DESC")
    fun getTotalTransactionsByChannel(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Map<String, Any>>
    
    @Query("SELECT t.channelCode as channel, SUM(t.txnTotalAmount) as totalAmount FROM TransactionVolume t WHERE t.reportDate BETWEEN :startDate AND :endDate GROUP BY t.channelCode ORDER BY totalAmount DESC")
    fun getTotalAmountByChannel(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Map<String, Any>>
    
    @Query("SELECT SUM(t.txnSuccessCount) as successfulTransactions, SUM(t.txnFailedCount) as failedTransactions FROM TransactionVolume t WHERE t.reportDate BETWEEN :startDate AND :endDate")
    fun getSuccessFailureRatio(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): Map<String, Any>
}

@Repository
interface ATMTransactionReportRepository : JpaRepository<AtmTransactionData, Long> {
    @Query("SELECT COUNT(*) as totalTransactions FROM AtmTransactionData a WHERE a.reportDate BETWEEN :startDate AND :endDate")
    fun getTotalTransactions(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): Long
    
    @Query("SELECT a.atmId as atmId, COUNT(*) as transactionCount, SUM(a.totalLoadedAmount) as totalAmount FROM AtmTransactionData a WHERE a.reportDate BETWEEN :startDate AND :endDate GROUP BY a.atmId ORDER BY COUNT(*) DESC")
    fun getTopATMsByTransactionVolume(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Map<String, Any>>
}

@Repository
interface POSTerminalReportRepository : JpaRepository<PosTerminalData, Long> {
    @Query("SELECT p.mccCode as mcc, SUM(p.terminalsActiveCount) as activeTerminals FROM PosTerminalData p WHERE p.reportDate BETWEEN :startDate AND :endDate GROUP BY p.mccCode ORDER BY SUM(p.terminalsActiveCount) DESC")
    fun getActiveTerminalsByMCC(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): List<Map<String, Any>>
    
    @Query("SELECT SUM(p.terminalsIssuedCount) as issuedCount, SUM(p.terminalsActiveCount) as activeCount, SUM(p.terminalsDecomCount) as decomCount FROM PosTerminalData p WHERE p.reportDate BETWEEN :startDate AND :endDate")
    fun getTerminalLifecycleStats(@Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): Map<String, Any>
}
