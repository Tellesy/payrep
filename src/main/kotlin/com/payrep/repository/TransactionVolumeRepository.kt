package com.payrep.repository

import com.payrep.domain.TransactionVolume
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TransactionVolumeRepository : JpaRepository<TransactionVolume, Long>
