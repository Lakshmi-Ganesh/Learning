package com.appointment.hospital.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.appointment.hospital.entity.HospitalInfo;

@Repository
public interface HospitalRepo extends JpaRepository<HospitalInfo, String>  {

	@Query("Select h from HospitalInfo h WHERE h.hospId = :hospId")
	public HospitalInfo findByHospId(@Param("hospId") String hospId);
	
}
