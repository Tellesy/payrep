package com.payrep.domain

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(
    name = "atm_transaction_data",
    uniqueConstraints = [UniqueConstraint(columnNames = ["atm_id", "bank_or_tpp_id", "report_date"])]
)
data class AtmTransactionData(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    val atmId: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val branchName: String,

    @Column(nullable = false)
    val txnSuccessCount: Int,

    @Column(nullable = false)
    val txnFailedCount: Int,

    @Column(nullable = false)
    val totalLoadedAmount: BigDecimal,

    @Column(nullable = false)
    val transactionCategory: String,

    @Column(nullable = false)
    val reportDate: LocalDate
)
