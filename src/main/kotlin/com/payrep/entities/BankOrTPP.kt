package com.payrep.entities

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "bank_or_tpp")
data class BankOrTPP(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true)
    val code: String,

    @Column(nullable = false)
    val name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: Type
) {
    enum class Type {
        BANK, TPP
    }
}
