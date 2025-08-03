package com.payrep.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "transaction_volume")
data class TransactionVolume(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val transactionDate: LocalDate,

    @Column(nullable = false)
    val channel: String, // POS, ATM, E_COMMERCE, MOBILE

    @Column(nullable = false, precision = 15, scale = 2)
    val totalAmount: BigDecimal,

    @Column(nullable = false)
    val transactionCount: Long,

    @Column(nullable = true)
    val currency: String = "LYD",

    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val fileName: String // Reference to source file
)
