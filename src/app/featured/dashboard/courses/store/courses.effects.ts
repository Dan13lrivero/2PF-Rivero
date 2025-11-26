import { inject, Injectable } from "@angular/core";
import { CoursesService } from "../../../../core/services/courses/courses";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { CoursesActions } from "./courses.actions";
import { catchError, concatMap, delay, map } from "rxjs";

@Injectable()
export class CoursesEffect {

    constructor(private courseService: CoursesService, private actions$: Actions) {
        this.actions$ = inject(Actions);
    }

        loadCourses$ = createEffect(() =>{
            return this.actions$.pipe(
                delay(2000),
                ofType(CoursesActions.loadCourses),
                concatMap(() =>
                    this.courseService.getCoursesForEffect().pipe(
                        map((courses) => CoursesActions.loadCoursesSucess({courses})),
                        catchError((error) => [CoursesActions.loadCoursesFailure({error})])
                    )
                )
            )
        })
    }
