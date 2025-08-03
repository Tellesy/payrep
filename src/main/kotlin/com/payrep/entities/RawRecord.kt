package com.payrep.entities

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "raw_record")
data class RawRecord(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val fileName: String,

    @Column(nullable = false)
    val lineNumber: Int,

    @Lob
    @Column(nullable = false)
    val rawData: String,

    @Column(nullable = false)
    val importTime: LocalDateTime,

    @Column(nullable = false)
    val processed: Boolean = false,

    @Column(nullable = true)
    val errorMessage: String?
)
