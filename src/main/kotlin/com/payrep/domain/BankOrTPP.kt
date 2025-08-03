package com.payrep.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

enum class BankOrTPPType {
    BANK, TPP
}

@Entity
@Table(name = "bank_or_tpp")
data class BankOrTPP(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, length = 3)
    val code: String,

    @Column(nullable = false)
    val name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: BankOrTPPType,

    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    @OneToMany(mappedBy = "bankOrTPP", cascade = [CascadeType.ALL])
    val fileProcessingConfigs: MutableSet<FileProcessingConfig> = mutableSetOf()
}
