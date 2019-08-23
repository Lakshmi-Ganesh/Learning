package com.easybuy.supermarket.service;

import com.easybuy.supermarket.entity.UserRegistration;
import com.easybuy.supermarket.responsePattern.ResponsePattern;

public interface UserRegistrationService {
	
	public ResponsePattern registerUser(UserRegistration user);

}
