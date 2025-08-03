package com.payrep.domain

import jakarta.persistence.*

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(
    name = "atm_terminal_data",
    uniqueConstraints = [UniqueConstraint(columnNames = ["institution_id", "report_date"])]
)
data class AtmTerminalData(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val institution_id: String,
    val institution_name: String,
    val atm_new_count: Int,
    val atm_active_count: Int,
    val atm_inactive_count: Int,
    val atm_maintenance_count: Int,
    val atm_location_type: String,
    val atm_total_count: Int,
    val report_date: LocalDate
)
