package com.payrep.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "wizard")
class WizardEntityConfig {
    var dynamicEntities: List<DynamicEntityDescriptor> = emptyList()
}

// Config-side descriptors to allow adding entities via application.yml
class DynamicFieldDescriptor {
    var name: String = ""
    var type: String = "String"
    var required: Boolean = false
}

class DynamicEntityDescriptor {
    var name: String = ""
    var fields: List<DynamicFieldDescriptor> = emptyList()
}
