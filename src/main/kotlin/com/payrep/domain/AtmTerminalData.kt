package com.payrep.domain

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(
    name = "atm_terminal_data",
    uniqueConstraints = [UniqueConstraint(columnNames = ["bank_or_tpp_id", "report_date"])]
)
data class AtmTerminalData(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val atmNewCount: Int,

    @Column(nullable = false)
    val atmActiveCount: Int,

    @Column(nullable = false)
    val atmInactiveCount: Int,

    @Column(nullable = false)
    val atmMaintenanceCount: Int,

    @Column(nullable = false)
    val atmLocationType: String,

    @Column(nullable = false)
    val atmTotalCount: Int,

    @Column(nullable = false)
    val reportDate: LocalDate
)
