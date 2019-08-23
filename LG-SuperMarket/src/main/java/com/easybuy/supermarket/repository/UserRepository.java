package com.easybuy.supermarket.repository;
import org.springframework.data.jpa.repository.JpaRepository;
 
import org.springframework.stereotype.Repository;

import com.easybuy.supermarket.entity.UserRegistration;
@Repository
public interface UserRepository extends JpaRepository<UserRegistration,String> {

}
