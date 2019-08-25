import { UserRegServicesComponent } from './../services/UserReg.services.component';
import { Component, OnInit } from '@angular/core';
import {SignUpVO} from 'src/dto/SignUpVO';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
public signupvo: SignUpVO = new SignUpVO();

  constructor(private userregService: UserRegServicesComponent) { }

  ngOnInit() {

    this.signupvo.gender = 'F';
  }
  sendRequest() {
    const requestObj: any = new Object();
    requestObj['firstName'] = this.signupvo.firstName;
    requestObj['lastName'] = this.signupvo.lastName;
    requestObj['password'] = this.signupvo.password;
    requestObj['confirmPassword'] = this.signupvo.confirmPassword;
    requestObj['emailId'] = this.signupvo.emailId;
    requestObj['gender'] = this.signupvo.gender;
    requestObj['dateOfBirth'] = this.signupvo.dateOfBirth;
    console.log(requestObj);

this.userregService.UserRegInfo(requestObj).then(data => {

console.log(data);
}).catch(error => {

  console.log('Error Occured' + error);
});

  }
}
