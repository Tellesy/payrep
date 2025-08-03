package com.payrep.domain

import jakarta.persistence.*

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(
    name = "card_lifecycle",
    uniqueConstraints = [UniqueConstraint(columnNames = ["institution_id", "report_date"])]
)
data class CardLifecycle(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val institution_id: String,
    val institution_name: String,
    val card_product_code: String,
    val card_product_type: String,
    val card_technology_type: String,
    val cards_issued_count: Int,
    val cards_delivered_count: Int,
    val cards_activated_count: Int,
    val cards_renewed_count: Int,
    val cards_reissued_count: Int,
    val cards_deactivated_count: Int,
    val cards_activity_count: Int,
    val report_date: LocalDate
)
