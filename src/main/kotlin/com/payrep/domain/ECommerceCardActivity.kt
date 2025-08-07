package com.payrep.domain

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(
    name = "ecommerce_card_activity",
    uniqueConstraints = [UniqueConstraint(columnNames = ["bank_or_tpp_id", "report_date"])]
)
data class ECommerceCardActivity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val cardProductCode: String,

    @Column(nullable = false)
    val ecommerceEnabledCards: Int,

    @Column(nullable = false)
    val ecommerceActivityCards: Int,

    @Column(nullable = false)
    val reportDate: LocalDate
)
