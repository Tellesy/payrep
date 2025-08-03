package com.payrep.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "column_mapping")
data class ColumnMapping(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "file_processing_config_id", nullable = false)
    val fileProcessingConfig: FileProcessingConfig,

    @Column(nullable = false)
    val columnName: String,

    @Column(nullable = false)
    val entityType: String, // e.g., CardIssuance, TransactionVolume

    @Column(nullable = false)
    val fieldName: String, // e.g., amount, transactionDate

    @Column(nullable = true)
    val transformation: String? = null, // Optional transformation logic

    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
)
