package com.easybuy.supermarket.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easybuy.supermarket.entity.UserRegistration;
import com.easybuy.supermarket.responsePattern.ResponsePattern;
import com.easybuy.supermarket.service.UserRegistrationService;
@RestController
@RequestMapping("/userRegistration")
public class RegistringUser {
	
	@Autowired
	UserRegistrationService userRegistration;
	
	@PostMapping(value="/Registration")
	private ResponseEntity<ResponsePattern> registerUser(@RequestBody UserRegistration user){
		System.out.println(user);
//		if(user != null) {
			ResponsePattern respat = userRegistration.registerUser(user);
			System.out.println(respat);
			return new ResponseEntity<ResponsePattern>(respat,HttpStatus.OK);
			
			
		}
//		return null;
	}
	

//}
