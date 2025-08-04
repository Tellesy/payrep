package com.payrep.domain

import java.time.LocalDate
import javax.persistence.*

/**
 * Base class for all report types
 */
@Entity
@Table(name = "reports")
@Inheritance(strategy = InheritanceType.JOINED)
abstract class Report(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    val institutionId: String,

    @Column(nullable = false)
    val institutionName: String,

    @Column(nullable = false)
    val reportDate: LocalDate,

    @Column(nullable = false)
    val reportType: String,

    @Column(nullable = false)
    val fileName: String,
    
    @Column(nullable = false)
    val processedAt: LocalDate = LocalDate.now()
)

/**
 * Represents transaction volume report data
 */
@Entity
@Table(name = "transaction_volume_reports")
class TransactionVolumeReport(
    institutionId: String,
    institutionName: String,
    reportDate: LocalDate,
    fileName: String,
    
    @Column(nullable = false)
    val channelCode: String,
    
    @Column(nullable = false)
    val transactionTypeCode: String,
    
    @Column(nullable = false)
    val transactionTypeDesc: String,
    
    @Column(nullable = true)
    val mccCode: String?,
    
    @Column(nullable = true)
    val mccDescription: String?,
    
    @Column(nullable = false)
    val txnCount: Int,
    
    @Column(nullable = false)
    val txnTotalAmount: Double,
    
    @Column(nullable = false)
    val txnSuccessCount: Int,
    
    @Column(nullable = false)
    val txnFailedCount: Int,
    
    @Column(nullable = true)
    val transactionCategory: String?
) : Report(
    institutionId = institutionId,
    institutionName = institutionName,
    reportDate = reportDate,
    reportType = "TRANSACTION_VOLUME",
    fileName = fileName
)

/**
 * Represents ATM transaction data report
 */
@Entity
@Table(name = "atm_transaction_reports")
class ATMTransactionReport(
    institutionId: String,
    institutionName: String,
    reportDate: LocalDate,
    fileName: String,
    
    @Column(nullable = false)
    val atmId: String,
    
    @Column(nullable = false)
    val branchName: String,
    
    @Column(nullable = false)
    val txnSuccessCount: Int,
    
    @Column(nullable = false)
    val txnFailedCount: Int,
    
    @Column(nullable = false)
    val totalLoadedAmount: Double,
    
    @Column(nullable = true)
    val transactionCategory: String?
) : Report(
    institutionId = institutionId,
    institutionName = institutionName,
    reportDate = reportDate,
    reportType = "ATM_TRANSACTION",
    fileName = fileName
)

/**
 * Represents POS terminal data report
 */
@Entity
@Table(name = "pos_terminal_reports")
class POSTerminalReport(
    institutionId: String,
    institutionName: String,
    reportDate: LocalDate,
    fileName: String,
    
    @Column(nullable = true)
    val mccCode: String?,
    
    @Column(nullable = true)
    val mccDescription: String?,
    
    @Column(nullable = false)
    val terminalsIssuedCount: Int,
    
    @Column(nullable = false)
    val terminalsDeliveredCount: Int,
    
    @Column(nullable = false)
    val terminalsReissuedCount: Int,
    
    @Column(nullable = false)
    val terminalsDecomCount: Int,
    
    @Column(nullable = false)
    val terminalsActiveCount: Int,
    
    @Column(nullable = false)
    val terminalsActivityCount: Int,
    
    @Column(nullable = false)
    val terminalsTotalCount: Int
) : Report(
    institutionId = institutionId,
    institutionName = institutionName,
    reportDate = reportDate,
    reportType = "POS_TERMINAL",
    fileName = fileName
)
