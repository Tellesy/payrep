package com.payrep.service

import com.payrep.domain.*
import java.math.BigDecimal
import java.time.LocalDate

private fun Any.asString(): String = this.toString()
private fun Any.asInt(): Int = this.toString().toInt()
private fun Any.asBigDecimal(): BigDecimal = this.toString().toBigDecimal()
private fun Any.asLocalDate(): LocalDate = LocalDate.parse(this.toString())

fun Map<String, Any>.toAtmTerminalData(): AtmTerminalData = AtmTerminalData(
    institution_id = this["institution_id"]!!.asString(),
    institution_name = this["institution_name"]!!.asString(),
    atm_new_count = this["atm_new_count"]!!.asInt(),
    atm_active_count = this["atm_active_count"]!!.asInt(),
    atm_inactive_count = this["atm_inactive_count"]!!.asInt(),
    atm_maintenance_count = this["atm_maintenance_count"]!!.asInt(),
    atm_location_type = this["atm_location_type"]!!.asString(),
    atm_total_count = this["atm_total_count"]!!.asInt(),
    report_date = this["report_date"]!!.asLocalDate()
)

fun Map<String, Any>.toAtmTransactionData(): AtmTransactionData = AtmTransactionData(
    atm_id = this["atm_id"]!!.asString(),
    institution_id = this["institution_id"]!!.asString(),
    institution_name = this["institution_name"]!!.asString(),
    branch_name = this["branch_name"]!!.asString(),
    txn_success_count = this["txn_success_count"]!!.asInt(),
    txn_failed_count = this["txn_failed_count"]!!.asInt(),
    total_loaded_amount = this["total_loaded_amount"]!!.asBigDecimal(),
    transaction_category = this["transaction_category"]!!.asString(),
    report_date = this["report_date"]!!.asLocalDate()
)

fun Map<String, Any>.toCardLifecycle(): CardLifecycle = CardLifecycle(
    institution_id = this["institution_id"]!!.asString(),
    institution_name = this["institution_name"]!!.asString(),
    card_product_code = this["card_product_code"]!!.asString(),
    card_product_type = this["card_product_type"]!!.asString(),
    card_technology_type = this["card_technology_type"]!!.asString(),
    cards_issued_count = this["cards_issued_count"]!!.asInt(),
    cards_delivered_count = this["cards_delivered_count"]!!.asInt(),
    cards_activated_count = this["cards_activated_count"]!!.asInt(),
    cards_renewed_count = this["cards_renewed_count"]!!.asInt(),
    cards_reissued_count = this["cards_reissued_count"]!!.asInt(),
    cards_deactivated_count = this["cards_deactivated_count"]!!.asInt(),
    cards_activity_count = this["cards_activity_count"]!!.asInt(),
    report_date = this["report_date"]!!.asLocalDate()
)

fun Map<String, Any>.toECommerceCardActivity(): ECommerceCardActivity = ECommerceCardActivity(
    institution_id = this["institution_id"]!!.asString(),
    institution_name = this["institution_name"]!!.asString(),
    card_product_code = this["card_product_code"]!!.asString(),
    ecommerce_enabled_cards = this["ecommerce_enabled_cards"]!!.asInt(),
    ecommerce_activity_cards = this["ecommerce_activity_cards"]!!.asInt(),
    report_date = this["report_date"]!!.asLocalDate()
)

fun Map<String, Any>.toPosTerminalData(): PosTerminalData = PosTerminalData(
    institution_id = this["institution_id"]!!.asString(),
    institution_name = this["institution_name"]!!.asString(),
    mcc_code = this["mcc_code"]!!.asString(),
    mcc_description = this["mcc_description"]!!.asString(),
    terminals_issued_count = this["terminals_issued_count"]!!.asInt(),
    terminals_delivered_count = this["terminals_delivered_count"]!!.asInt(),
    terminals_reissued_count = this["terminals_reissued_count"]!!.asInt(),
    terminals_decom_count = this["terminals_decom_count"]!!.asInt(),
    terminals_active_count = this["terminals_active_count"]!!.asInt(),
    terminals_activity_count = this["terminals_activity_count"]!!.asInt(),
    terminals_total_count = this["terminals_total_count"]!!.asInt(),
    report_date = this["report_date"]!!.asLocalDate()
)

fun Map<String, Any>.toPosTransactionData(): PosTransactionData = PosTransactionData(
    bank_name = this["bank_name"]!!.asString(),
    txn_success_count = this["txn_success_count"]!!.asInt(),
    txn_failed_count = this["txn_failed_count"]!!.asInt(),
    total_transaction_amount = this["total_transaction_amount"]!!.asBigDecimal(),
    transaction_category = this["transaction_category"]!!.asString(),
    report_date = this["report_date"]!!.asLocalDate()
)

fun Map<String, Any>.toTransactionVolume(fileName: String): TransactionVolume = TransactionVolume(
    institution_id = this["institution_id"]!!.asString(),
    institution_name = this["institution_name"]!!.asString(),
    channel_code = this["channel_code"]!!.asString(),
    transaction_type_code = this["transaction_type_code"]!!.asString(),
    transaction_type_desc = this["transaction_type_desc"]!!.asString(),
    mcc_code = this["mcc_code"]!!.asString(),
    mcc_description = this["mcc_description"]!!.asString(),
    txn_count = this["txn_count"]!!.asInt(),
    txn_total_amount = this["txn_total_amount"]!!.asBigDecimal(),
    txn_success_count = this["txn_success_count"]!!.asInt(),
    txn_failed_count = this["txn_failed_count"]!!.asInt(),
    transaction_category = this["transaction_category"]!!.asString(),
    report_date = this["report_date"]!!.asLocalDate(),
    fileName = fileName
)
