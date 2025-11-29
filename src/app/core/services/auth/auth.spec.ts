import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AuthService } from './auth';
import { API_URL } from '../../utils/constants';
import { User, Role } from './model/User';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  let store: MockStore;

  const initialState = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        provideMockStore({ initialState })
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    store = TestBed.inject(MockStore);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('setToken', () => {
    it('debería guardar el token en localStorage', () => {
      const email = 'test@test.com';
      service.setToken(email);
      expect(localStorage.getItem('token')).toBe(email);
    });
  });

  describe('isAuthenticated', () => {
    it('debería retornar false si no hay token en localStorage', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('debería retornar true si hay un token en localStorage', () => {
      localStorage.setItem('token', 'some-token');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('debería remover el token de localStorage y navegar a login', () => {
      localStorage.setItem('token', 'some-token');
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['login']);
    });

    it('debería limpiar el usuario cuando hace logout', () => {
      service.user = { id: 1, username: 'testuser', email: 'test@test.com', password: '123', role: Role.ADMIN };
      service.logout();
      expect(service.user).toBeNull();
    });
  });

  describe('login', () => {
    it('debería hacer una petición GET a /users y retornar lista de usuarios', () => {
      const mockUsers: User[] = [
        { id: 1, username: 'testuser', email: 'test@test.com', password: '123', role: Role.ADMIN }
      ];

      service.login('test@test.com', '123').subscribe((user) => {
        expect(user).toEqual(mockUsers[0]);
      });

      const req = httpMock.expectOne(`${API_URL}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });
});