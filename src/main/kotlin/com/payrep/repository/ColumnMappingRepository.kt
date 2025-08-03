package com.payrep.repository

import com.payrep.domain.ColumnMapping
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ColumnMappingRepository : JpaRepository<ColumnMapping, Long> {
    fun findByFileProcessingConfigId(fileProcessingConfigId: Long): List<ColumnMapping>
    fun findByEntityType(entityType: String): List<ColumnMapping>
}
