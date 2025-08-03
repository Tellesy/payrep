package com.payrep.repository

import com.payrep.domain.PosTerminalData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PosTerminalDataRepository : JpaRepository<PosTerminalData, Long>
