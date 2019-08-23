package com.easybuy.supermarket.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name="UserRegistration")
public class UserRegistration {

	@Id
	@GeneratedValue
	@Column(name="userId")
	private Long userId;
	
	
	@Column(name="first_name")
	@JsonProperty("firstName")
	private String firstName;
	
	
	@Column(name="last_name")
	@JsonProperty("lastName")
	private String lastName;
	
	
	@Column(name="password")
	@JsonProperty("password")
	private String password;
	
	
	@Column(name="confirm_password")
	@JsonProperty("confirmPassword")
	private String confirmPassword;
	
	
	@Column(name="email")
	@JsonProperty("emailId")
	private String emailId;
	
	
	@Column(name="gender")
	@JsonProperty("gender")
	private String gender;
	
	@Column(name="dob")
@JsonFormat(shape=JsonFormat.Shape.STRING, pattern="dd-mm-yyyy")
	

	private Date dateOfBirth;
	
	

	public Long getUserId() {
		return userId;
	}



	public void setUserId(Long userId) {
		this.userId = userId;
	}



	public String getFirstName() {
		return firstName;
	}



	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}



	public String getLastName() {
		return lastName;
	}



	public void setLastName(String lastName) {
		this.lastName = lastName;
	}



	public String getPassword() {
		return password;
	}



	public void setPassword(String password) {
		this.password = password;
	}



	public String getConfirmPassword() {
		return confirmPassword;
	}



	public void setConfirmPassword(String confirmPassword) {
		this.confirmPassword = confirmPassword;
	}



	public String getEmailId() {
		return emailId;
	}



	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}



	public String getGender() {
		return gender;
	}



	public void setGender(String gender) {
		this.gender = gender;
	}



	public Date getDateOfBirth() {
		return dateOfBirth;
	}



	public void setDateOfBirth(Date dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}



	@Override
	public String toString() {
		return "UserRegistration [userId=" + userId + ", firstName=" + firstName + ", lastName=" + lastName
				+ ", password=" + password + ", confirmPassword=" + confirmPassword + ", emailId=" + emailId
				+ ", gender=" + gender + ", dateOfBirth=" + dateOfBirth + ", getClass()=" + getClass() + ", hashCode()="
				+ hashCode() + ", toString()=" + super.toString() + "]";
	}
	
}
