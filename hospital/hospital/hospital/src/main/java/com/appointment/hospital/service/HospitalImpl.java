package com.appointment.hospital.service;

import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.appointment.hospital.entity.HospitalInfo;
import com.appointment.hospital.entity.UserRegistration;
import com.appointment.hospital.repo.HospitalRepo;
import com.appointment.hospital.repo.RegistrationRepo;
import com.appointment.hospital.response.ResponseMessage;


@Service
public class HospitalImpl implements HospitalService {

	@Autowired
	private HospitalRepo hospRepo;
	
	@Autowired
	private RegistrationRepo userRepo;
	
	@Override
	public ResponseMessage hospitalinfo(HospitalInfo hosp) {
		ResponseMessage response = new ResponseMessage();
		System.out.println(hosp.getUser().getUserId());
		Optional<UserRegistration> user = userRepo.findById(hosp.getUser().getUserId());
		if(hosp.getUser().getTypeOfUser().equals("Doctor") && user.get().getTypeOfUser().equals("Doctor")) {
			String hospitalId = "Hosp-"+hosp.getHospName().substring(0, 4)+"-"+hosp.getUser().getFirstName().substring(0, 4);
			hosp.setHospId(hospitalId);
			HospitalInfo hos = hospRepo.saveAndFlush(hosp);
			if(hos != null) {
				response.setStatus("SUCCESS");
				response.setResponseMsg("saved successfully");
				return response;
			}
		}else {
			response.setStatus("FAILED");
			response.setResponseMsg("Type of User should be Doctor");
			return response;
		}
		
		return null;
	}

	@Override
	public ResponseMessage updateHospital(String hospId, HospitalInfo hosp) {
		ResponseMessage response = new ResponseMessage();
		System.out.println(hosp.getHospDescription());
		HospitalInfo hospital = hospRepo.findByHospId(hospId);
		if(hospital != null && hospital.getHospId().equals(hosp.getHospId())) {
			hosp.setHospId(hospital.getHospId());
			BeanUtils.copyProperties(hosp, hospital);
			HospitalInfo gow = hospRepo.saveAndFlush(hosp);
			System.out.println(gow.getHospDescription());
			response.setStatus("SUCESS");
			response.setResponseMsg("Updated successfully");
			return response;
		}else {
			response.setStatus("FAILED");
			response.setResponseMsg("Updated Failed");
			return response;
		}
	
	}

	@Override
	public ResponseMessage deleteHospital(String hospId) {
		ResponseMessage response = new ResponseMessage();
		try {
	    	hospRepo.deleteById(hospId);
	    	response.setStatus("SUCESS");
			response.setResponseMsg("Deleted successfully");
			return response;
	     }catch(IllegalArgumentException e) {
	    	 response.setStatus("FAILED");
	    	 response.getResponseMsg("Id not found "+e.getStackTrace());
	    	 return response;
	    }
	}
	
	
}
