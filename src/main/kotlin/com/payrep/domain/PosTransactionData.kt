package com.payrep.domain

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(
    name = "pos_transaction_data",
    uniqueConstraints = [UniqueConstraint(columnNames = ["bank_or_tpp_id", "transaction_category", "report_date"])]
)
data class PosTransactionData(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val txnSuccessCount: Int,

    @Column(nullable = false)
    val txnFailedCount: Int,

    @Column(nullable = false)
    val totalTransactionAmount: BigDecimal,

    @Column(nullable = false)
    val transactionCategory: String,

    @Column(nullable = false)
    val reportDate: LocalDate
)
