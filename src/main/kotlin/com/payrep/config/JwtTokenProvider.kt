package com.payrep.config

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.util.Date

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret:dev-insecure-secret-change-me}") private val jwtSecret: String,
    @Value("\${jwt.validity.ms:3600000}") private val validityInMilliseconds: Long, // default 1 hour
) {

    // Stable key derived from configuration
    private val secretKey = Keys.hmacShaKeyFor(jwtSecret.toByteArray(StandardCharsets.UTF_8))

    fun generateToken(authentication: Authentication): String {
        val username = authentication.name
        val claims = Jwts.claims().setSubject(username)
        
        // Add authorities/roles to the token
        val authorities = authentication.authorities.joinToString(",") { it.authority }
        claims["auth"] = authorities
        
        val now = Date()
        val validity = Date(now.time + validityInMilliseconds)

        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(secretKey)
            .compact()
    }

    fun getAuthentication(token: String): Authentication {
        val claims: Claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).body
        
        // Extract authorities from token
        val authoritiesString = claims["auth"] as? String ?: ""
        val authorities = if (authoritiesString.isNotEmpty()) {
            authoritiesString.split(",").map { SimpleGrantedAuthority(it) }
        } else {
            listOf(SimpleGrantedAuthority("ROLE_USER"))
        }
        
        return UsernamePasswordAuthenticationToken(claims.subject, "", authorities)
    }

    fun validateToken(token: String): Boolean {
        return try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token)
            true
        } catch (e: Exception) {
            false // Can log specific exceptions like ExpiredJwtException, SignatureException etc.
        }
    }
}
