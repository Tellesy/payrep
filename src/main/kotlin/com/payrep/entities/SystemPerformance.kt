package com.payrep.entities

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "system_performance")
data class SystemPerformance(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val reportDate: LocalDate,

    @Column(nullable = false)
    val availabilityPercentage: Double,

    @Column(nullable = false)
    val downtimeMinutes: Double,

    @Column(nullable = false)
    val averageResponseTime: Double,

    @Column(nullable = false)
    val errorRate: Double
)
