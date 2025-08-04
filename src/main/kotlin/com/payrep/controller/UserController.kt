package com.payrep.controller

import com.payrep.dto.ChangePasswordDto
import com.payrep.dto.CreateUserDto
import com.payrep.dto.ResetPasswordDto
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import com.payrep.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {

    @PostMapping
    fun createUser(@RequestBody createUserDto: CreateUserDto): ResponseEntity<Any> {
        return try {
            userService.createUser(createUserDto)
            ResponseEntity.status(HttpStatus.CREATED).build<Any>()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(e.message)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.")
        }
    }

    @PostMapping("/reset-password")
    fun resetPassword(@RequestBody resetPasswordDto: ResetPasswordDto): ResponseEntity<Any> {
        return try {
            userService.resetPassword(resetPasswordDto)
            ResponseEntity.ok().build<Any>()
        } catch (e: UsernameNotFoundException) {
            ResponseEntity.notFound().build<Any>()
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.")
        }
    }

    @PostMapping("/change-password")
    fun changePassword(@RequestBody changePasswordDto: ChangePasswordDto): ResponseEntity<Any> {
        return try {
            userService.changePassword(changePasswordDto)
            ResponseEntity.ok().build<Any>()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(e.message)
        } catch (e: Exception) {
            ResponseEntity.status(500).body("An unexpected error occurred.")
        }
    }

    @GetMapping
    fun getAllUsers(): ResponseEntity<Any> {
        return try {
            val users = userService.getAllUsers()
            ResponseEntity.ok(users)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.")
        }
    }

    @DeleteMapping("/{username}")
    fun deleteUser(@PathVariable username: String): ResponseEntity<Any> {
        return try {
            userService.deleteUser(username)
            ResponseEntity.ok().build<Any>()
        } catch (e: UsernameNotFoundException) {
            ResponseEntity.notFound().build<Any>()
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.")
        }
    }
}
