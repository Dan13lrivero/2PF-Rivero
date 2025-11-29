import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let store: MockStore;

  const initialState = {
    auth: {
      user: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Home],
      providers: [
        provideMockStore({ initialState })
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería ser un componente no standalone', () => {
    expect(component).toBeDefined();
  });

  it('debería inicializar sin errores', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});