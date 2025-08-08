package com.payrep.repository

import com.payrep.domain.HeaderDefinition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface HeaderDefinitionRepository : JpaRepository<HeaderDefinition, Long> {
    fun findByEntityType(entityType: String): List<HeaderDefinition>
    fun findByEntityTypeAndKey(entityType: String, key: String): HeaderDefinition?
    fun findByEntityTypeAndDisplayName(entityType: String, displayName: String): HeaderDefinition?
}
