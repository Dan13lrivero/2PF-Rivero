import { createFeature, createReducer, on } from '@ngrx/store';
import * as StudentsActions from './students.actions';
import { User } from '../../../users/interface/User';

export interface StudentsState {
  [x: string]: any;
  students: User[];
  loading: boolean;
}

const initialState: StudentsState = {
  students: [],
  loading: false,
};

export const studentsFeature = createFeature({
  name: 'students',
  reducer: createReducer(
    initialState,
    on(StudentsActions.loadStudents, (state) => ({ ...state, loading: true })),
    on(StudentsActions.loadStudentsSuccess, (state, { students }) => ({
      ...state,
      students,
      loading: false,
    })),
  ),
});

export const {
  name: studentsFeatureKey,
  reducer: studentsReducer,
  selectStudents,
  selectLoading,
} = studentsFeature;
