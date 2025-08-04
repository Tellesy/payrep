package com.payrep.dto

data class ChangePasswordDto(
    val oldPassword: String,
    val newPassword: String
)
