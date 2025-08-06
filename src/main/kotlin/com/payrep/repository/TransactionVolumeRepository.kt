package com.payrep.repository

import com.payrep.domain.TransactionVolume
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface TransactionVolumeRepository : JpaRepository<TransactionVolume, Long> {
    @Query("SELECT t FROM TransactionVolume t WHERE t.report_date BETWEEN :startDate AND :endDate")
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<TransactionVolume>
}
