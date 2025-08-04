package com.payrep.domain

import jakarta.persistence.*

@Entity
@Table(name = "users")
open class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    open var id: Long? = null,

    @Column(nullable = false, unique = true)
    open var username: String = "",

    @Column(nullable = false)
    open var password: String = "",

    @Column(nullable = false)
    open var enabled: Boolean = true
)
