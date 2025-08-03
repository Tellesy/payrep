package com.payrep.entities

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "file_column_mapping")
data class FileColumnMapping(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "file_processing_config_id", nullable = false)
    val fileProcessingConfig: FileProcessingConfig,

    @Column(nullable = false)
    val columnName: String,

    @Column(nullable = false)
    val targetEntity: String,

    @Column(nullable = false)
    val targetField: String,

    @Column(nullable = true)
    val transformation: String?,

    @Column(nullable = false)
    val required: Boolean = true,

    @Column(nullable = false)
    val position: Int,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = true)
    val updatedAt: LocalDateTime? = null
)
