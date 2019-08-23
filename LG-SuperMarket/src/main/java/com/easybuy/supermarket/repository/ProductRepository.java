package com.easybuy.supermarket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.easybuy.supermarket.entity.ProductInfo;
@Repository
public interface ProductRepository extends JpaRepository<ProductInfo,String> {

}
