package com.appointment.hospital.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appointment.hospital.entity.Payment;

@Repository
public interface PaymentRepo extends JpaRepository<Payment, Long>{

}
