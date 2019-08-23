package com.appointment.hospital.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appointment.hospital.entity.UserLogin;
import com.appointment.hospital.entity.UserRegistration;
import com.appointment.hospital.response.ResponseMessage;
import com.appointment.hospital.service.RegistrationService;

@RestController
@RequestMapping(value="user")
public class Registration {
    
	@Autowired
	private RegistrationService regService;
	
	@PostMapping(value="/Registration")
	private ResponseEntity<ResponseMessage> userRegistration(@RequestBody UserRegistration user){	
		    ResponseMessage response = 	regService.UserRegistration(user);
			return new ResponseEntity<ResponseMessage>(response,HttpStatus.OK);
	}
	
	
	@PostMapping(value="/login")
	private ResponseEntity<ResponseMessage> userLogin(@RequestBody UserLogin login){	
		    ResponseMessage response = 	regService.UserLogin(login);
			return new ResponseEntity<ResponseMessage>(response,HttpStatus.OK);
	}
	
	
	
	
}
