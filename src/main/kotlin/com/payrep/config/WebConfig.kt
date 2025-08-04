package com.payrep.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.config.annotation.EnableWebMvc

@Configuration
open class WebConfig : WebMvcConfigurer {

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/", "classpath:/static/admin-ui/build/")
    }

    override fun addViewControllers(registry: ViewControllerRegistry) {
        registry.addViewController("/")
            .setViewName("forward:/index.html")
        registry.addViewController("/{x:[\\w\\-]+}")
            .setViewName("forward:/index.html")
        registry.addViewController("/{x:^(?!api$).*}/{y:[\\w\\-]+}")
            .setViewName("forward:/index.html")
    }


}
