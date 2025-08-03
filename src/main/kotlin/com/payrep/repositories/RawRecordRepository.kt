package com.payrep.repositories

import com.payrep.entities.RawRecord
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RawRecordRepository : JpaRepository<RawRecord, Long> {
    fun findByFileName(fileName: String): List<RawRecord>
    fun findByBankOrTPPIdAndProcessed(bankOrTppId: Long, processed: Boolean): List<RawRecord>
}
