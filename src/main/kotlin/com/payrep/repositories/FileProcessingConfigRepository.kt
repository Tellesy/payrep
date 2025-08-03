package com.payrep.repositories

import com.payrep.entities.FileProcessingConfig
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FileProcessingConfigRepository : JpaRepository<FileProcessingConfig, Long> {
    fun findByBankOrTPPId(bankOrTppId: Long): List<FileProcessingConfig>
}
