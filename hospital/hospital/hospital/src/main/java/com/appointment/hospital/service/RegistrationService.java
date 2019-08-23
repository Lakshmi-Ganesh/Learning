package com.appointment.hospital.service;

import com.appointment.hospital.entity.UserLogin;
import com.appointment.hospital.entity.UserRegistration;
import com.appointment.hospital.response.ResponseMessage;

public interface RegistrationService {

	ResponseMessage UserRegistration(UserRegistration user);
	ResponseMessage UserLogin(UserLogin login);
	
	
}
