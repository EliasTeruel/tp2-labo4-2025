import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private userInfoSubject = new BehaviorSubject<any>(null);
  public userInfo$ = this.userInfoSubject.asObservable();
  private loggedInSubject = new BehaviorSubject<boolean>(!!this.getCurrentUserEmail());
  public loggedIn$ = this.loggedInSubject.asObservable();

  private rolSubject = new BehaviorSubject<string | null>(this.getRol());
  public rol$ = this.rolSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('savedUserMail');
    if (savedUser) {
      this.userInfoSubject.next({ email: savedUser });
      this.loggedInSubject.next(true)
    }
     const rol = this.getRol();
    if (rol) {
      this.rolSubject.next(rol);
    }
  }
setRol(rol: string | null) {
    if (rol) {
      localStorage.setItem('userRol', rol);
    } else {
      localStorage.removeItem('userRol');
    }
    this.rolSubject.next(rol);
  }


  getRol(): string | null {
    return localStorage.getItem('userRol');
  }
  setLoggedIn(logged: boolean) {
    this.loggedInSubject.next(logged);
  }
  register(userData: any) {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('name', userData.name);
    formData.append('age', userData.age.toString());
    if (userData.avatar) {
      formData.append('avatar', userData.avatar);
    }

    return this.http.post(`${this.apiUrl}/auth/register`, formData);
  }

  resendVerificationEmail(email: string) {
    return this.http.post(`${this.apiUrl}/auth/resend-verification`, { email });
  }

  setUserInfo(email: string) {
    localStorage.setItem('savedUserMail', email);
    this.userInfoSubject.next({ email });
    this.loggedInSubject.next(true);
  }

  clearUserInfo() {
    localStorage.removeItem('savedUserMail');
    localStorage.removeItem('userRol');
    this.userInfoSubject.next(null);
    this.loggedInSubject.next(false);
    this.rolSubject.next(null);
  }

  getCurrentUserEmail(): string | null {
    return localStorage.getItem('savedUserMail');
  }
}
