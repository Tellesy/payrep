package com.payrep.domain

import jakarta.persistence.*

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(
    name = "pos_transaction_data",
    uniqueConstraints = [UniqueConstraint(columnNames = ["bank_name", "transaction_category", "report_date"])]
)
data class PosTransactionData(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val bank_name: String,
    val txn_success_count: Int,
    val txn_failed_count: Int,
    val total_transaction_amount: BigDecimal,
    val transaction_category: String,
    val report_date: LocalDate
)
