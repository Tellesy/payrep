package com.payrep.dto

data class ResetPasswordDto(
    val username: String,
    val newPassword: String
)
