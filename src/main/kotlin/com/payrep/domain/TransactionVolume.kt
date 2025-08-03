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
            "institution_id",
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

    @Column(nullable = false)
    val institution_id: String,

    @Column(nullable = false)
    val institution_name: String,

    @Column(nullable = false)
    val channel_code: String,

    @Column(nullable = false)
    val transaction_type_code: String,

    val transaction_type_desc: String,

    @Column(nullable = false)
    val mcc_code: String,

    val mcc_description: String,

    @Column(nullable = false)
    val txn_count: Int,

    @Column(nullable = false, precision = 15, scale = 2)
    val txn_total_amount: BigDecimal,

    @Column(nullable = false)
    val txn_success_count: Int,

    @Column(nullable = false)
    val txn_failed_count: Int,

    @Column(nullable = false)
    val transaction_category: String,

    @Column(nullable = false)
    val report_date: LocalDate,

    @Column(nullable = true)
    val currency: String = "LYD",

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: LocalDateTime? = null,

    @Column(nullable = false)
    val fileName: String
)
