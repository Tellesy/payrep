package com.payrep.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "header_definition",
    uniqueConstraints = [UniqueConstraint(columnNames = ["entity_type", "header_key"])])
data class HeaderDefinition(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "entity_type", nullable = false)
    val entityType: String, // e.g., "E-Commerce Card Activity"

    @Column(name = "header_key", nullable = false)
    val key: String, // normalized key, e.g., ecommerce_enabled_cards

    @Column(name = "display_name", nullable = false)
    var displayName: String, // current header shown in files

    @OneToMany(mappedBy = "headerDefinition", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    val aliases: MutableSet<HeaderAlias> = mutableSetOf(),

    @CreationTimestamp
    @Column(name = "created_at")
    val createdAt: LocalDateTime? = null,

    @UpdateTimestamp
    @Column(name = "updated_at")
    val updatedAt: LocalDateTime? = null
)
