import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders, Component } from '@angular/core';
const routes: Routes = [


  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: '', component: LoginComponent},
  {path: 'LGSuperMarket', component: LoginComponent},


];


export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
