package com.payrep.entities

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

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
    val reportDate: LocalDate,

    @Column(nullable = false)
    val channel: Channel,

    @Column(nullable = false)
    val totalTransactions: Long,

    @Column(nullable = false)
    val totalAmount: BigDecimal
) {
    enum class Channel {
        POS, ATM, ECOMMERCE, MOBILE, INTERNET
    }
}
