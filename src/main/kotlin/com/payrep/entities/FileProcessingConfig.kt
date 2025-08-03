package com.payrep.entities

import jakarta.persistence.*
import java.time.LocalTime

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
    val filenamePattern: String,

    @Column(nullable = false)
    val scheduleTime: LocalTime,

    @Column(nullable = false)
    val fileFormat: FileFormat
) {
    enum class FileFormat {
        CSV, EXCEL, TSV
    }
}
