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
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CubeFormComponent } from './admin/cube-form/cube-form.component';


@NgModule({
  declarations: [
    LoginComponent,
    AdminComponent,
    CubeFormComponent
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
  HomeModule,
  MatTableModule,
  MatDialogModule,
  MatSelectModule,
  MatCardModule
]
})
export class LoginModule { }
