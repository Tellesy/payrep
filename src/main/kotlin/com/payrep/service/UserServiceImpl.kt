package com.payrep.service

import com.payrep.domain.User
import com.payrep.dto.ChangePasswordDto
import com.payrep.dto.CreateUserDto
import com.payrep.dto.ResetPasswordDto
import com.payrep.repository.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserServiceImpl(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) : UserService {

    override fun changePassword(changePasswordDto: ChangePasswordDto) {
        val authentication = SecurityContextHolder.getContext().authentication
        val username = authentication.name

        val user = userRepository.findByUsername(username)
            ?: throw UsernameNotFoundException("User not found")

        if (!passwordEncoder.matches(changePasswordDto.oldPassword, user.password)) {
            throw IllegalArgumentException("Invalid old password")
        }

        user.password = passwordEncoder.encode(changePasswordDto.newPassword)
        userRepository.save(user)
    }

    override fun createUser(createUserDto: CreateUserDto) {
        if (userRepository.findByUsername(createUserDto.username) != null) {
            throw IllegalArgumentException("Username already exists")
        }

        val user = User(
            username = createUserDto.username,
            password = passwordEncoder.encode(createUserDto.password)
        )

        userRepository.save(user)
    }

    override fun resetPassword(resetPasswordDto: ResetPasswordDto) {
        val user = userRepository.findByUsername(resetPasswordDto.username)
            ?: throw UsernameNotFoundException("User not found")

        user.password = passwordEncoder.encode(resetPasswordDto.newPassword)
        userRepository.save(user)
    }

    override fun getAllUsers(): List<User> {
        return userRepository.findAll()
    }

    override fun deleteUser(username: String) {
        val user = userRepository.findByUsername(username)
            ?: throw UsernameNotFoundException("User not found")
        userRepository.delete(user)
    }
}
