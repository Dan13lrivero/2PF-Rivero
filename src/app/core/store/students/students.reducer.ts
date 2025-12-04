import { createFeature, createReducer, on } from '@ngrx/store';
import * as StudentsActions from './students.actions';
import { Student } from '../../models/Student'; 

export interface StudentsState {
  [x: string]: any;
  students: Student[]; 
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