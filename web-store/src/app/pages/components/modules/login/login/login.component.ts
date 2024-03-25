import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  hide: boolean = true;
  username: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onLogin(): void {
    if (this.username === 'admin' && this.password === 'admin') {
      this.router.navigate(['/home']);
      alert('Logged in successfully');
    } else{
      alert('Invalid credentials');
    }
  }

}

