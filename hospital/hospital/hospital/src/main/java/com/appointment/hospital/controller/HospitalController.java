package com.appointment.hospital.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appointment.hospital.entity.HospitalInfo;
import com.appointment.hospital.response.ResponseMessage;
import com.appointment.hospital.service.HospitalService;

@RestController
@RequestMapping(value="hospital")
public class HospitalController {

	@Autowired
	private HospitalService hospital;
	
	@PostMapping(value="/info")
	private ResponseEntity<ResponseMessage> hospitalInfo(@RequestBody HospitalInfo hosp){
		
		if(hosp != null) {
			ResponseMessage r = hospital.hospitalinfo(hosp);
			return new ResponseEntity<ResponseMessage>(r,HttpStatus.OK);
		}else {
			ResponseMessage re =new ResponseMessage();
			return new ResponseEntity<ResponseMessage>(re,HttpStatus.OK);
		}
		
		
	}
	
	
	@PutMapping(value="/update/{hospId}")
    private ResponseEntity<?> hospitalUpdate(@PathVariable String hospId, @RequestBody HospitalInfo hosp){	
		 
		if(hospId != null && hosp != null) {
			ResponseMessage r = hospital.updateHospital(hospId, hosp);
			return new ResponseEntity<ResponseMessage>(r,HttpStatus.OK);
		}else {
			ResponseMessage re =new ResponseMessage();
			re.setStatus("FAILED");
			re.setResponseMsg("Failed to update..!");
			return new ResponseEntity<ResponseMessage>(re,HttpStatus.OK);
		}
		
	}
	
	@DeleteMapping(value="/delete/{hospId}")
	private ResponseEntity<?> deleteHospitalInfo(@PathVariable String hospId){
		if(hospId != null) {
			ResponseMessage r = hospital.deleteHospital(hospId);
			return new ResponseEntity<ResponseMessage>(r,HttpStatus.OK);
		}else {
			ResponseMessage re =new ResponseMessage();
			re.setStatus("FAILED");
			re.setResponseMsg("Failed to update..!");
			return new ResponseEntity<ResponseMessage>(re,HttpStatus.OK);
		}
	}
	
}
