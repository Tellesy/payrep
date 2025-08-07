package com.payrep.domain

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "institution_id_converter",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["source_institution_id", "processor_code"])
    ]
)
data class InstitutionIdConverter(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, length = 10)
    val sourceInstitutionId: String, // The ID that comes in CSV files (e.g., "025")

    @Column(nullable = false, length = 3)
    val processorCode: String, // The TPP/Bank code that sent this file (e.g., "901")

    @Column(nullable = false, length = 3)
    val targetBankOrTppCode: String, // The actual BankOrTPP.code this maps to (e.g., "025")

    @Column(length = 500)
    val description: String? = null, // Optional description for this mapping

    @Column(nullable = false)
    val isActive: Boolean = true,

    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime? = null
)
