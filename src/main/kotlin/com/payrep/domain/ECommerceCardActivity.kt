package com.payrep.domain

import jakarta.persistence.*

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(
    name = "ecommerce_card_activity",
    uniqueConstraints = [UniqueConstraint(columnNames = ["institution_id", "report_date"])]
)
data class ECommerceCardActivity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val institution_id: String,
    val institution_name: String,
    val card_product_code: String,
    val ecommerce_enabled_cards: Int,
    val ecommerce_activity_cards: Int,
    val report_date: LocalDate
)
