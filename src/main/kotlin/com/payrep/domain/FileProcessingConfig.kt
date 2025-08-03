package com.payrep.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "file_processing_config")
data class FileProcessingConfig(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "bank_or_tpp_id", nullable = false)
    val bankOrTPP: BankOrTPP,

    @Column(nullable = false)
    val directoryPath: String,

    @Column(nullable = false)
    val fileNamePattern: String,

    @Column(nullable = false)
    val scheduleTime: String, // CRON expression

    @Column(nullable = false)
    val fileType: String, // CSV, EXCEL, etc.

    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    @OneToMany(mappedBy = "fileProcessingConfig", cascade = [CascadeType.ALL])
    val columnMappings: MutableSet<ColumnMapping> = mutableSetOf()

    @OneToMany(mappedBy = "fileProcessingConfig", cascade = [CascadeType.ALL])
    val importLogs: MutableSet<ImportLog> = mutableSetOf()
}
