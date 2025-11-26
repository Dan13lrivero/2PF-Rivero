import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RootState } from '../../../core/store';
import { selectUser } from '../../../core/store/auth/auth.selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  user$: Observable<any>;

  constructor(private store: Store<RootState>) {
    this.user$ = this.store.select(selectUser);
  }
}