package com.payrep.entities

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "import_log")
data class ImportLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val fileName: String,

    @Column(nullable = false)
    val importTime: LocalDateTime,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: Status,

    @Column(length = 1000)
    val errorMessage: String? = null
) {
    enum class Status {
        PENDING, SUCCESS, FAILED
    }
}
