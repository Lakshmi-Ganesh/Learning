import { Component, OnInit,Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {REQUEST_HEADER} from '../../constants/constants';
import {HEADER} from '../../constants/constants';
@Component({
  selector: 'app-services',

})
@Injectable()
export class UserRegServicesComponent implements OnInit {
public url: any = 'http://localhost:8080/';
  constructor(private httpclient: HttpClient) { }

  ngOnInit() {
  }
public UserRegInfo(UserReg: Object) {
  // const requestOptions = new RequestOptions(REQUEST_HEADER);
const usrurl = this.url + 'userRegistration/Registration';
return this.httpclient.post(usrurl, UserReg, { headers: HEADER })
.toPromise().then((response: Response) =>{console.log(response);}   ).catch(this.handleError);
}

private handleError(error: any): Promise<any> {
  console.error('An error occurred', error);
  console.log('ERROR' + error);
  return Promise.reject(error.message || error);
}
}
