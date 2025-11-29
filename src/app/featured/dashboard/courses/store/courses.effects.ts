import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CoursesService } from '../../../../core/services/courses/courses';
import { CoursesActions } from './courses.actions';
import { catchError, concatMap, delay, map, of, tap } from 'rxjs';

@Injectable()
export class CoursesEffect {
  loadCourses$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CoursesActions.loadCourses),
      concatMap(() =>
        this.courseService.getCoursesForEffect().pipe(
          delay(2000),
          map((courses) => {
            return CoursesActions.loadCoursesSuccess({ courses });
          }),
          catchError((error) => of(CoursesActions.loadCoursesFailure({ error })))
        )
      )
    );
  });

  deleteCourse$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CoursesActions.deleteCourse),
      concatMap(({ id }) => {
        this.courseService.deleteCourse(id);
        return of(CoursesActions.deleteCourseSuccess({ id }));
      })
    );
  });

  constructor(private courseService: CoursesService, private actions$: Actions) {
    this.actions$ = inject(Actions);
  }
}