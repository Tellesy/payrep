package com.payrep.repository

import com.payrep.domain.ImportLog
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImportLogRepository : JpaRepository<ImportLog, Long> {
    fun findByFileProcessingConfigId(fileProcessingConfigId: Long): List<ImportLog>
    fun findByStatus(status: ImportLog.ImportStatus): List<ImportLog>
    fun findByFileName(fileName: String): ImportLog?
}
