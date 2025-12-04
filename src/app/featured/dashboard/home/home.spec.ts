import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';
import { provideMockStore } from '@ngrx/store/testing';
import { selectUser } from '../../../core/store/auth/auth.selector';
import { MatCardModule } from '@angular/material/card';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  const initialState = {
    auth: {
      user: {
        id: 1,
        username: 'user test',
        email: 'test@gmail.com',
        role: 'USER'
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Home],
      imports: [MatCardModule],
      providers: [
        provideMockStore({
          initialState,
          selectors: [
            { selector: selectUser, value: initialState.auth.user }
          ]
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
