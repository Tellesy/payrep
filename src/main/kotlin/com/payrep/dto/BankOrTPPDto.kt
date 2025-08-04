package com.payrep.dto

import com.payrep.domain.BankOrTPPType

data class BankOrTppDto(
    val id: Long?,
    val code: String,
    val name: String,
    val type: BankOrTPPType
)

