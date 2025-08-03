package com.payrep.repository

import com.payrep.domain.PosTransactionData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PosTransactionDataRepository : JpaRepository<PosTransactionData, Long>
