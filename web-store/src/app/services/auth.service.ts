import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

const TOKEN_KEY = 'admin_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) {}

  login(username: string, password: string): Observable<{ token: string }> {
    return this.httpClient.post<{ token: string }>(
      `${window.__env.apiUrl}/api/auth/login`, { username, password }
    ).pipe(
      tap(res => localStorage.setItem(TOKEN_KEY, res.token))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
