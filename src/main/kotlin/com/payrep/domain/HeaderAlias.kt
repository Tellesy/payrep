package com.payrep.domain

import jakarta.persistence.*

@Entity
@Table(name = "header_alias")
data class HeaderAlias(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "header_definition_id", nullable = false)
    val headerDefinition: HeaderDefinition,

    @Column(name = "alias", nullable = false)
    val alias: String
)
