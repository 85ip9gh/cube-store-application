import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  hide: boolean = true;
  username: string = '';
  password: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onLogin(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/admin/home']),
      error: () => alert('Invalid credentials')
    });
  }

}

