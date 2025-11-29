import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Course } from '../../../../core/services/courses/model/Course';

export const CoursesActions = createActionGroup({
  source: 'Courses',
  events: {
    'Load Courses': emptyProps(),
    'Load Courses Success': props<{ courses: Course[] }>(),
    'Load Courses Failure': props<{ error: any }>(),
    'Add Course': props<{ course: Course }>(),
    'Update Courses': props<{ courses: Course[] }>(),
    'Delete Course': props<{ id: number }>(),
    'Delete Course Success': props<{ id: number }>(),
    'Delete Course Failure': props<{ error: any }>(),
    'Clear Courses': emptyProps(),
  },
});