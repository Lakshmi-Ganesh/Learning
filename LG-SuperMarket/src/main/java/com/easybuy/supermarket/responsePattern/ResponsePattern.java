package com.easybuy.supermarket.responsePattern;

import com.easybuy.supermarket.entity.UserRegistration;

public class ResponsePattern {
	
	
	private String status;
	
	private String body;
	
	private UserRegistration user;

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getBody() {
		return body;
	}

	public void setBody(String body) {
		this.body = body;
	}

	public UserRegistration getUser() {
		return user;
	}

	public void setUser(UserRegistration user) {
		this.user = user;
	}

	@Override
	public String toString() {
		return "ResponsePattern [status=" + status + ", body=" + body + ", user=" + user + "]";
	}
	
	

}
