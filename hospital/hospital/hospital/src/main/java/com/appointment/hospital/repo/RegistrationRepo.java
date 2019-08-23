package com.appointment.hospital.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.appointment.hospital.entity.UserRegistration;

@Repository
public interface RegistrationRepo extends JpaRepository<UserRegistration,String > {

	@Query("SELECT us FROM UserRegistration us WHERE us.firstName = :firstName and us.password = :password and us.typeOfUser = :typeOfUser")
	public UserRegistration findByName(@Param("firstName") String firstName,@Param("password") String password,@Param("typeOfUser") String typeOfUser);
	
}
