package com.appointment.hospital.response;

import com.appointment.hospital.entity.UserRegistration;

public class ResponseMessage {

	private String status;
	
	private String responseMsg;
	
	private UserRegistration users;

	public UserRegistration getUsers() {
		return users;
	}

	public void setUsers(UserRegistration users) {
		this.users = users;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getResponseMsg() {
		return responseMsg;
	}

	public void setResponseMsg(String responseMsg) {
		this.responseMsg = responseMsg;
	}

	public void getResponseMsg(String string) {
		// TODO Auto-generated method stub
		
	}
	
	
	
	
	
}
