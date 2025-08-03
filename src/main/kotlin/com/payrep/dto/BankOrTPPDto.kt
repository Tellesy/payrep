package com.payrep.dto

import com.payrep.domain.BankOrTPP
import com.payrep.domain.BankOrTPP.BankOrTPPType

data class BankOrTPPDto(
    val id: Long? = null,
    val code: String,
    val name: String,
    val type: BankOrTPPType
) {
    companion object {
        fun fromEntity(entity: BankOrTPP) = BankOrTPPDto(
            id = entity.id,
            code = entity.code,
            name = entity.name,
            type = entity.type
        )
    }
}
