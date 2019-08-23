package com.appointment.hospital.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.appointment.hospital.repo.RegistrationRepo;
import com.appointment.hospital.response.ResponseMessage;

@Service
public class RegistrationImpl implements RegistrationService{
 
	@Autowired
	private RegistrationRepo repo;
	
	@Override
	public ResponseMessage UserRegistration(com.appointment.hospital.entity.UserRegistration user) {
		if(user!= null) {
			
			ResponseMessage r = new ResponseMessage();
			Date d=new Date();  
	        int year=d.getYear()+1900;  
			String userId = "USER-"+year+"-"+user.getFirstName().substring(0, 4);
			System.out.println(userId);
			user.setUserId(userId);
			com.appointment.hospital.entity.UserRegistration userReg = repo.saveAndFlush(user);
			if(userReg != null) {
				r.setStatus("SUCESS");
				r.setResponseMsg("User Registered Successfully..!");		
			}
			return r;
		}else {
		
			ResponseMessage res = new ResponseMessage();
			res.setStatus("FAILED");
			res.setResponseMsg("User Registered Failed..!");
			return res;
		}
	}

	@Override
	public ResponseMessage UserLogin(com.appointment.hospital.entity.UserLogin login) {
		if(login != null) {
			ResponseMessage res = new ResponseMessage();
			com.appointment.hospital.entity.UserRegistration userlogin = repo.findByName(login.getUserName(),login.getPassword(),login.getTypeOfUser());
			 if(userlogin != null) {
				 res.setStatus("SUCCESS");
				
				 res.setResponseMsg("User Logged Successfully..!");
				 res.setUsers(userlogin);
			 }else {
				 res.setStatus("FAILED");
				 res.setResponseMsg("User Logging in failed..!");
			 }
			 return res;
		}else {
			ResponseMessage res = new ResponseMessage();
			res.setStatus("FAILED");
			res.setResponseMsg("Getting Empty Object...");
			return res;
		}
	}

}
