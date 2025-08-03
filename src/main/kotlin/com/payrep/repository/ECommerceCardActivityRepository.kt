package com.payrep.repository

import com.payrep.domain.ECommerceCardActivity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ECommerceCardActivityRepository : JpaRepository<ECommerceCardActivity, Long>
