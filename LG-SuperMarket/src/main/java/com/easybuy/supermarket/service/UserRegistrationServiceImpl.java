package com.easybuy.supermarket.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easybuy.supermarket.entity.UserRegistration;
import com.easybuy.supermarket.repository.UserRepository;
import com.easybuy.supermarket.responsePattern.ResponsePattern;




@Service
public class UserRegistrationServiceImpl implements UserRegistrationService {

@Autowired
UserRepository userrepo;
	
	@Override
	public ResponsePattern registerUser(UserRegistration user) {
		
		if(user!= null) {
			
			ResponsePattern resp = new ResponsePattern();
			UserRegistration user1=userrepo.saveAndFlush( user);
			if(user1 != null) {
				
				resp.setStatus("Success");
				resp.setBody("Registration Done");
				resp.setUser(user1);
			}
			
			return resp;
			
			
		}
		
		else {
			ResponsePattern resperror = new ResponsePattern();
			resperror.setStatus("Failed");
			resperror.setBody("Something went wrong");
			
			return resperror;
		}
	
	}

	

}
