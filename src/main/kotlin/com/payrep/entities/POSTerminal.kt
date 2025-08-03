package com.payrep.entities

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "pos_terminal")
data class POSTerminal(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val reportDate: LocalDate,

    @Column(nullable = false)
    val totalTerminals: Long,

    @Column(nullable = false)
    val activeTerminals: Long,

    @Column(nullable = false)
    val inactiveTerminals: Long,

    @Column(nullable = false)
    val locations: String
)
