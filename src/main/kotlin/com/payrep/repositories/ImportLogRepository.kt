package com.payrep.repositories

import com.payrep.entities.ImportLog
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImportLogRepository : JpaRepository<ImportLog, Long> {
    fun findByBankOrTPPIdAndStatus(bankOrTppId: Long, status: ImportLog.Status): List<ImportLog>
    fun findByFileName(fileName: String): ImportLog?
}
