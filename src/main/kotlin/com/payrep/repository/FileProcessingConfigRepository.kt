package com.payrep.repository

import com.payrep.domain.FileProcessingConfig
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FileProcessingConfigRepository : JpaRepository<FileProcessingConfig, Long> {
    fun findByBankOrTPPId(bankOrTPPId: Long): List<FileProcessingConfig>
    fun findByDirectoryPath(directoryPath: String): List<FileProcessingConfig>
}
