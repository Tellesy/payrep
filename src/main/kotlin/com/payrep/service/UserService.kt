package com.payrep.service

import com.payrep.dto.ChangePasswordDto
import com.payrep.dto.CreateUserDto
import com.payrep.domain.User
import com.payrep.dto.ResetPasswordDto

interface UserService {
        fun changePassword(changePasswordDto: ChangePasswordDto)
        fun createUser(createUserDto: CreateUserDto)
        fun resetPassword(resetPasswordDto: ResetPasswordDto)
    fun getAllUsers(): List<User>
    fun deleteUser(username: String)
}
