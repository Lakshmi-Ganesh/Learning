package com.appointment.hospital.service;

import com.appointment.hospital.entity.Payment;
import com.appointment.hospital.response.ResponseMessage;

public interface PaymentService {

	ResponseMessage paymentInfo(Payment payment);
	
}
