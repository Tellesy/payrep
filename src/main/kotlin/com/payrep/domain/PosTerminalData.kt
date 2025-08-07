package com.payrep.domain

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(
    name = "pos_terminal_data",
    uniqueConstraints = [UniqueConstraint(columnNames = ["bank_or_tpp_id", "mcc_code", "report_date"])]
)
data class PosTerminalData(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val mccCode: String,

    @Column(nullable = false)
    val mccDescription: String,

    @Column(nullable = false)
    val terminalsIssuedCount: Int,

    @Column(nullable = false)
    val terminalsDeliveredCount: Int,

    @Column(nullable = false)
    val terminalsReissuedCount: Int,

    @Column(nullable = false)
    val terminalsDecomCount: Int,

    @Column(nullable = false)
    val terminalsActiveCount: Int,

    @Column(nullable = false)
    val terminalsActivityCount: Int,

    @Column(nullable = false)
    val terminalsTotalCount: Int,

    @Column(nullable = false)
    val reportDate: LocalDate
)
