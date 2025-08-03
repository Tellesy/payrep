package com.payrep.entities

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "card_issuance")
data class CardIssuance(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val reportDate: LocalDate,

    @Column(nullable = false)
    val cardType: String,

    @Column(nullable = false)
    val totalIssued: Long,

    @Column(nullable = false)
    val activeCards: Long,

    @Column(nullable = false)
    val inactiveCards: Long
)
