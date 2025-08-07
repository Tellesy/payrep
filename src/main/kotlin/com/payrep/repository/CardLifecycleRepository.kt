package com.payrep.repository

import com.payrep.domain.CardLifecycle
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface CardLifecycleRepository : JpaRepository<CardLifecycle, Long> {
    @Query("SELECT c FROM CardLifecycle c WHERE c.reportDate BETWEEN :startDate AND :endDate")
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<CardLifecycle>
}
