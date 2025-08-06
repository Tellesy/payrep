package com.payrep.repository

import com.payrep.domain.AtmTransactionData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface AtmTransactionDataRepository : JpaRepository<AtmTransactionData, Long> {
    @Query("SELECT a FROM AtmTransactionData a WHERE a.report_date BETWEEN :startDate AND :endDate")
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<AtmTransactionData>
}
