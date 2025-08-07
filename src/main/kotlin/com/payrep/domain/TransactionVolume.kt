package com.payrep.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(
    name = "transaction_volume",
    uniqueConstraints = [
        UniqueConstraint(columnNames = [
            "bank_or_tpp_id",
            "channel_code",
            "transaction_type_code",
            "mcc_code",
            "transaction_category",
            "report_date"
        ])
    ]
)
data class TransactionVolume(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val channelCode: String,

    @Column(nullable = false)
    val transactionTypeCode: String,

    @Column(nullable = true)
    val transactionTypeDesc: String?,

    @Column(nullable = false)
    val mccCode: String,

    @Column(nullable = true)
    val mccDescription: String?,

    @Column(nullable = false)
    val txnCount: Int,

    @Column(nullable = false, precision = 15, scale = 2)
    val txnTotalAmount: BigDecimal,

    @Column(nullable = false)
    val txnSuccessCount: Int,

    @Column(nullable = false)
    val txnFailedCount: Int,

    @Column(nullable = false)
    val transactionCategory: String,

    @Column(nullable = false)
    val reportDate: LocalDate,

    @Column(nullable = true)
    val currency: String = "LYD",

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: LocalDateTime? = null,

    @Column(nullable = false)
    val fileName: String
)
