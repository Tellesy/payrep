package com.payrep.domain

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(
    name = "atm_transaction_data",
    uniqueConstraints = [UniqueConstraint(columnNames = ["atm_id", "institution_id", "report_date"])]
)
data class AtmTransactionData(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val atm_id: String,
    val institution_id: String,
    val institution_name: String,
    val branch_name: String,
    val txn_success_count: Int,
    val txn_failed_count: Int,
    val total_loaded_amount: BigDecimal,
    val transaction_category: String,
    val report_date: LocalDate
)
