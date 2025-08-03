package com.payrep.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "import_log")
data class ImportLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "file_processing_config_id", nullable = false)
    val fileProcessingConfig: FileProcessingConfig,

    @Column(nullable = false)
    val fileName: String,

    @Column(nullable = false)
    val importTime: LocalDateTime,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: ImportStatus,

    @Column(nullable = true)
    val errorMessage: String? = null,

    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    enum class ImportStatus {
        PENDING, SUCCESS, FAILED
    }
}
