import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../utils/constants';
import { User } from './model/User';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { RootState } from '../../store';
import { selectUser } from '../../store/auth/auth.selector';
import { setAuthUser } from '../../store/auth/auth.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = `${API_URL}/auth/login`;
  private usersUrl = `${API_URL}/users`;
  user: User | null = null;
  user$: Observable<any>;

  constructor(private http: HttpClient, private router: Router, private store: Store<RootState>) {
    this.user$ = this.store.select(selectUser);

    const token = localStorage.getItem('token');

    if (token) {
      this.user = { id: 'local', username: 'Usuario', email: '', password: '', role: 'USER' as any };
    }
  }

  login(email: string, password: string) {
    return this.http.post<any>(this.authUrl, { email, password }).pipe(
      map((res) => {
        const user = res.user;
        if (!user) {
          throw new Error('Usuario no encontrado');
        }
        this.setToken(`${user.email}&${password}`);
        this.store.dispatch(setAuthUser({ payload: user }));
        return user;
      }),
      catchError((error) => {
        return throwError(() => new Error(error?.error?.error || 'Credenciales inválidas'));
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.user = null;
    this.router.navigate(['login']);
  }

  setToken(email: string) {
    localStorage.setItem('token', email);
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }
    return true;
  }
}