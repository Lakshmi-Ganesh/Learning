package com.appointment.hospital.service;

import com.appointment.hospital.entity.HospitalInfo;
import com.appointment.hospital.response.ResponseMessage;

public interface HospitalService {

	
	ResponseMessage hospitalinfo(HospitalInfo hosp);
	ResponseMessage updateHospital(String hospId, HospitalInfo hosp);
	ResponseMessage deleteHospital(String hospId);
	
}
