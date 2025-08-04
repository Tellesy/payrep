package com.payrep.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.payrep.dto.LoginRequest
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.util.matcher.AntPathRequestMatcher

class JsonUsernamePasswordAuthenticationFilter(
    authenticationManager: AuthenticationManager
) : AbstractAuthenticationProcessingFilter(AntPathRequestMatcher("/api/auth/login", "POST"), authenticationManager) {

    private val objectMapper = ObjectMapper()

    override fun attemptAuthentication(request: HttpServletRequest, response: HttpServletResponse): Authentication {
        try {
            println("Filter triggered for: ${request.method} ${request.requestURI}")
            val body = request.inputStream.bufferedReader().use { it.readText() }
            println("Attempting authentication with body: $body")
            
            if (body.isBlank()) {
                throw RuntimeException("Request body is empty")
            }
            
            val loginRequest = objectMapper.readValue(body, LoginRequest::class.java)
            println("Parsed login request: username=${loginRequest.username}")
            
            val authToken = UsernamePasswordAuthenticationToken(loginRequest.username, loginRequest.password)
            println("Created auth token, attempting authentication...")
            
            val result = this.authenticationManager.authenticate(authToken)
            println("Authentication successful: ${result.isAuthenticated}")
            return result
        } catch (e: Exception) {
            println("Authentication failed with exception: ${e.message}")
            e.printStackTrace()
            throw e
        }
    }

    override fun successfulAuthentication(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain, authResult: Authentication) {
        response.status = HttpServletResponse.SC_OK
        response.contentType = "application/json"
        response.writer.write("{\"message\": \"Login successful!\"}")
        response.writer.flush()
    }

    override fun unsuccessfulAuthentication(request: HttpServletRequest, response: HttpServletResponse, failed: AuthenticationException) {
        response.status = HttpServletResponse.SC_UNAUTHORIZED
        response.contentType = "application/json"
        response.writer.write("{\"error\": \"${failed.message}\"}")
        response.writer.flush()
    }
}
