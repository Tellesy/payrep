package com.payrep.repositories

import com.payrep.entities.FileColumnMapping
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FileColumnMappingRepository : JpaRepository<FileColumnMapping, Long> {
    fun findByFileProcessingConfigId(configId: Long): List<FileColumnMapping>
    fun findByFileProcessingConfigIdAndColumnName(configId: Long, columnName: String): FileColumnMapping?
}
