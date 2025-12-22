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
            // Normalize courses to ensure serviceDone exists and lastServiceDate is a Date
            const normalized = courses.map((c: any) => ({
              ...c,
              serviceDone: c.serviceDone === true,
              lastServiceDate: c.lastServiceDate ? new Date(c.lastServiceDate) : undefined,
            }));
            return CoursesActions.loadCoursesSuccess({ courses: normalized });
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

  updateCourse$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CoursesActions.updateCourse),
      concatMap(({ course }) =>
        this.courseService.updateCourseForEffect(course).pipe(
          map((updatedCourse: any) => {
            // Normalize response
            const normalized = {
              ...updatedCourse,
              serviceDone: updatedCourse.serviceDone === true,
              lastServiceDate: updatedCourse.lastServiceDate ? new Date(updatedCourse.lastServiceDate) : undefined,
            } as any;
            // Also update local cache so quick navigations won't show stale values
            this.courseService.setLocalCourse(normalized);
            // Keep local overrides consistent with the server result (so manual edits persist)
            this.courseService.setServiceOverride(normalized.id, !!normalized.serviceDone, normalized.lastServiceDate ? new Date(normalized.lastServiceDate) : undefined);
            return CoursesActions.updateCourseSuccess({ course: normalized });
          }),
          catchError((error) => of(CoursesActions.updateCourseFailure({ error })))
        )
      )
    );
  });

  constructor(private courseService: CoursesService, private actions$: Actions) {
    this.actions$ = inject(Actions);
  }
}