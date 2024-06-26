import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login/login.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { HomeModule } from '../home/home.module';


@NgModule({
  declarations: [
    LoginComponent,
    AdminComponent
  ],
  imports: [
  CommonModule,
  LoginRoutingModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatButtonModule,
  MatFormFieldModule,
  FormsModule,
  RouterModule,
  HomeModule
]
})
export class LoginModule { }
