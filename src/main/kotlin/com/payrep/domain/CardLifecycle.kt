package com.payrep.domain

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(
    name = "card_lifecycle",
    uniqueConstraints = [UniqueConstraint(columnNames = ["bank_or_tpp_id", "report_date"])]
)
data class CardLifecycle(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val cardProductCode: String,

    @Column(nullable = false)
    val cardProductType: String,

    @Column(nullable = false)
    val cardTechnologyType: String,

    @Column(nullable = false)
    val cardsIssuedCount: Int,

    @Column(nullable = false)
    val cardsDeliveredCount: Int,

    @Column(nullable = false)
    val cardsActivatedCount: Int,

    @Column(nullable = false)
    val cardsRenewedCount: Int,

    @Column(nullable = false)
    val cardsReissuedCount: Int,

    @Column(nullable = false)
    val cardsDeactivatedCount: Int,

    @Column(nullable = false)
    val cardsActivityCount: Int,

    @Column(nullable = false)
    val reportDate: LocalDate
)
