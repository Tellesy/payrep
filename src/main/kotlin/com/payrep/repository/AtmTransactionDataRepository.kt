package com.payrep.repository

import com.payrep.domain.AtmTransactionData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AtmTransactionDataRepository : JpaRepository<AtmTransactionData, Long>
