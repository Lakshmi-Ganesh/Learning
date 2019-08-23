package com.appointment.hospital.entity;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name="hospital")
public class HospitalInfo {

	@Id
	@Column(name="hosp_id")
	private String hospId;
	
	@Column(name="hosp_Name")
	private String hospName;
	
	@Column(name="hosp_description")
	private String hospDescription;
	
	@Column(name="hosp_address")
	private String hospAddress;
	
	@Column(name="appointment_start_time")
	private String appointmentStartTime;
	
	@Column(name="appointment_end_time")
	private String appointmentEndTime;
	
	@Column(name="consulting_fees")
	private String consultingFees;
	
	@Column(name="enable_appointment")
	private Boolean enableAppointment;
	
	@Column(name="img_url")
	private String imgUrl;
	
	@ManyToOne(fetch=FetchType.LAZY)
	private UserRegistration user;
	

	public String getHospId() {
		return hospId;
	}

	public UserRegistration getUser() {
		return user;
	}

	public void setUser(UserRegistration user) {
		this.user = user;
	}

	public void setHospId(String hospId) {
		this.hospId = hospId;
	}

	public String getHospName() {
		return hospName;
	}

	public void setHospName(String hospName) {
		this.hospName = hospName;
	}

	public String getHospDescription() {
		return hospDescription;
	}

	public void setHospDescription(String hospDescription) {
		this.hospDescription = hospDescription;
	}

	public String getHospAddress() {
		return hospAddress;
	}

	public void setHospAddress(String hospAddress) {
		this.hospAddress = hospAddress;
	}

	public String getAppointmentStartTime() {
		return appointmentStartTime;
	}

	public void setAppointmentStartTime(String appointmentStartTime) {
		this.appointmentStartTime = appointmentStartTime;
	}

	public String getAppointmentEndTime() {
		return appointmentEndTime;
	}

	public void setAppointmentEndTime(String appointmentEndTime) {
		this.appointmentEndTime = appointmentEndTime;
	}

	public String getConsultingFees() {
		return consultingFees;
	}

	public void setConsultingFees(String consultingFees) {
		this.consultingFees = consultingFees;
	}

	public Boolean getEnableAppointment() {
		return enableAppointment;
	}

	public void setEnableAppointment(Boolean enableAppointment) {
		this.enableAppointment = enableAppointment;
	}

	public String getImgUrl() {
		return imgUrl;
	}

	public void setImgUrl(String imgUrl) {
		this.imgUrl = imgUrl;
	}
	
	
	
}
