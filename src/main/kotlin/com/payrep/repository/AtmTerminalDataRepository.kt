package com.payrep.repository

import com.payrep.domain.AtmTerminalData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AtmTerminalDataRepository : JpaRepository<AtmTerminalData, Long>
