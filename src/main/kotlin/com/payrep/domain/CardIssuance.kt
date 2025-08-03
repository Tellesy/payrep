package com.payrep.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "card_issuance")
data class CardIssuance(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val cardNumber: String,

    @Column(nullable = false)
    val cardType: String, // DEBIT, CREDIT, PREPAID

    @Column(nullable = false)
    val issueDate: LocalDate,

    @Column(nullable = true)
    val expiryDate: LocalDate? = null,

    @Column(nullable = true)
    val customerType: String? = null, // INDIVIDUAL, CORPORATE

    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val fileName: String // Reference to source file
)
