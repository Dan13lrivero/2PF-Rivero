import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as StudentsActions from './students.actions';
import { UserServices } from '../../../core/services/user-service';
import { map, mergeMap } from 'rxjs/operators';

@Injectable()
export class StudentsEffects {
  loadStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentsActions.loadStudents),
      mergeMap(() =>
        this.userService.users$.pipe(
          map((students) =>
            StudentsActions.loadStudentsSuccess({ students })
          )
        )
      )
    )
  );

  constructor(private actions$: Actions, private userService: UserServices) {}
}
