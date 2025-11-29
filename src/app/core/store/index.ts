import { ActionReducerMap } from '@ngrx/store';
import { authFeaturekey, authReducer, AuthState } from './auth/auth.reducer';
import { coursesFeatureKey, reducer as coursesReducer, CoursesState } from '../../featured/dashboard/courses/store/courses.reducer';
import { studentsFeatureKey, studentsReducer, StudentsState } from './students/students.reducer';

export interface RootState {
  [authFeaturekey]: AuthState;
  [coursesFeatureKey]: CoursesState;
  [studentsFeatureKey]: StudentsState;
}

export const rootReducer: ActionReducerMap<RootState> = {
  [authFeaturekey]: authReducer,
  [coursesFeatureKey]: coursesReducer,
  [studentsFeatureKey]: studentsReducer,
};