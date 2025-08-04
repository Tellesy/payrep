package com.payrep.service

import com.payrep.repository.UserRepository
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
open class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    @Throws(UsernameNotFoundException::class)
    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findByUsername(username)
            ?: throw UsernameNotFoundException("User not found with username: ${username}")

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.username)
            .password(user.password)
            .disabled(!user.enabled)
            .authorities("ROLE_ADMIN") // All users are admins for now
            .build()
    }
}
