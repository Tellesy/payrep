package com.payrep.domain

import jakarta.persistence.*

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(
    name = "pos_terminal_data",
    uniqueConstraints = [UniqueConstraint(columnNames = ["institution_id", "mcc_code", "report_date"])]
)
data class PosTerminalData(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val institution_id: String,
    val institution_name: String,
    val mcc_code: String,
    val mcc_description: String,
    val terminals_issued_count: Int,
    val terminals_delivered_count: Int,
    val terminals_reissued_count: Int,
    val terminals_decom_count: Int,
    val terminals_active_count: Int,
    val terminals_activity_count: Int,
    val terminals_total_count: Int,
    val report_date: LocalDate
)
