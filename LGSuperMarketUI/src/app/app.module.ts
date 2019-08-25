import { routing } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { TextboxComponent } from './textbox/textbox.component';
import {UserRegServicesComponent} from './services/UserReg.services.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    TextboxComponent


  ],
  imports: [
    BrowserModule,
    routing,
    FormsModule,
    ReactiveFormsModule,

    HttpClientModule
  ],
  providers: [UserRegServicesComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
