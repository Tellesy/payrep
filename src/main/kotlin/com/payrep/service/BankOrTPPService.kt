package com.payrep.service

import com.payrep.dto.BankOrTppDto

interface BankOrTPPService {
    fun getAll(): List<BankOrTppDto>
    fun getById(id: Long): BankOrTppDto?
    fun create(dto: BankOrTppDto): BankOrTppDto
    fun update(id: Long, dto: BankOrTppDto): BankOrTppDto?
    fun delete(id: Long)
    fun findEntityById(id: Long): com.payrep.domain.BankOrTPP?
}
