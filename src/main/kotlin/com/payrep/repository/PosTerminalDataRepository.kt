package com.payrep.repository

import com.payrep.domain.PosTerminalData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface PosTerminalDataRepository : JpaRepository<PosTerminalData, Long> {
    @Query("SELECT p FROM PosTerminalData p WHERE p.reportDate BETWEEN :startDate AND :endDate")
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<PosTerminalData>
}
