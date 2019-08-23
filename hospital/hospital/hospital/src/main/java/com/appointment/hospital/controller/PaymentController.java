package com.appointment.hospital.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appointment.hospital.entity.Payment;
import com.appointment.hospital.response.ResponseMessage;
import com.appointment.hospital.service.PaymentService;

@RestController
@RequestMapping(value="payment")
public class PaymentController {

	@Autowired
	private PaymentService payService;
	
	@RequestMapping(value="/info")
	private ResponseEntity<?> paymentMethod(@RequestBody Payment payment){
		if(payment != null) {
			return new ResponseEntity<ResponseMessage>(payService.paymentInfo(payment),HttpStatus.OK);
		}else {
			return new ResponseEntity<String>("Sry payment not saved successfully..!",HttpStatus.OK);
		}
	}
	
	
}
