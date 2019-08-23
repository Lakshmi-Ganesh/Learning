package com.easybuy.supermarket.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
@Entity
@Table(name="Product")

public class ProductInfo {

	@Id
	@Column(name="prod_id")
	private String prodId;
	
	@Column(name="prod_Name")
	private String prodName;
	
	@Column(name="prod_Category")
	private String prodCategory;
	
	@Column(name="prod_Description")
	private String prodDescription;
	
	
}
