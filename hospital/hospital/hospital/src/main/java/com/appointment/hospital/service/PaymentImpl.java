package com.appointment.hospital.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.appointment.hospital.entity.Payment;
import com.appointment.hospital.repo.PaymentRepo;
import com.appointment.hospital.response.ResponseMessage;

@Service
public class PaymentImpl implements PaymentService{

	
	@Autowired
	private PaymentRepo paymentRepo;
	
	@Override
	public ResponseMessage paymentInfo(Payment payment) {
		ResponseMessage response = new ResponseMessage();
		Payment res = paymentRepo.saveAndFlush(payment);
		if(res!=null) {
			response.setStatus("SUCCESS");
			response.setResponseMsg("Successfully Saved");
			return response;
		}else {
			response.setStatus("FAILED");
			response.setResponseMsg("Payment Details not saved..");
			return response;
		}
	}

}
