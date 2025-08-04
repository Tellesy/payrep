package com.payrep.controller

import com.payrep.config.JwtTokenProvider
import com.payrep.dto.LoginRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

@RestController
@RequestMapping("/api/auth")
class LoginController(
    private val authenticationManager: AuthenticationManager,
    private val jwtTokenProvider: JwtTokenProvider
) {

    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): ResponseEntity<Map<String, String>> {
        return try {
            println("Login attempt for user: ${loginRequest.username}")

            val authToken = UsernamePasswordAuthenticationToken(
                loginRequest.username,
                loginRequest.password
            )

            val authentication: Authentication = authenticationManager.authenticate(authToken)
            println("Authentication successful for user: ${loginRequest.username}")

            val token = jwtTokenProvider.generateToken(authentication)
            ResponseEntity.ok(mapOf(
                "token" to token,
                "message" to "Login successful!",
                "user" to authentication.name
            ))
        } catch (e: AuthenticationException) {
            println("Authentication failed for user: ${loginRequest.username}, error: ${e.message}")
            ResponseEntity.status(401).body(mapOf(
                "error" to "Invalid username or password"
            ))
        } catch (e: Exception) {
            println("Unexpected error during login: ${e.message}")
            e.printStackTrace()
            ResponseEntity.status(500).body(mapOf(
                "error" to "Internal server error"
            ))
        }
    }

    @PostMapping("/logout")
    fun logout(request: HttpServletRequest, response: HttpServletResponse): ResponseEntity<Any> {
        val auth = SecurityContextHolder.getContext().authentication
        if (auth != null) {
            SecurityContextLogoutHandler().logout(request, response, auth)
        }
        return ResponseEntity.ok().build<Any>()
    }
}
