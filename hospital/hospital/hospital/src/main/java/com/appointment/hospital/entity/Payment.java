package com.appointment.hospital.entity;



import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="payment_info")
public class Payment {

	@Id
	@GeneratedValue
	@Column(name="payment_id")
	private Long paymentId;
	
	@Column(name="transaction_id")
	private String transactionId;
	
	@Column(name="user_id")
	private String userId;
	
	@Column(name="hospital_id")
	private String hospId;
	
	@Column(name="payment_date")
	private String paymentDate;
	
	@Column(name="payment_amount")
	private String paymentAmt;

	public Long getPaymentId() {
		return paymentId;
	}

	public void setPaymentId(Long paymentId) {
		this.paymentId = paymentId;
	}

	public String getTransactionId() {
		return transactionId;
	}

	public void setTransactionId(String transactionId) {
		this.transactionId = transactionId;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getHospId() {
		return hospId;
	}

	public void setHospId(String hospId) {
		this.hospId = hospId;
	}

	public String getPaymentDate() {
		return paymentDate;
	}

	public void setPaymentDate(String paymentDate) {
		this.paymentDate = paymentDate;
	}

	public String getPaymentAmt() {
		return paymentAmt;
	}

	public void setPaymentAmt(String paymentAmt) {
		this.paymentAmt = paymentAmt;
	}
	
	
	
}
