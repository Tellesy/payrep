package com.payrep.repository

import com.payrep.domain.CardLifecycle
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CardLifecycleRepository : JpaRepository<CardLifecycle, Long>
