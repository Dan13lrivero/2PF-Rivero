import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CoursesService } from '../../../../core/services/courses/courses';
import { RootState } from '../../../../core/store';
import { CoursesActions } from '../store/courses.actions';
import { formGroup } from './validators';

@Component({
  selector: 'app-courses-form',
  standalone: false,
  templateUrl: './courses-form.html',
  styleUrl: './courses-form.css',
})
export class CoursesForm {
  createForm: FormGroup;
  courseId: number | null = null;
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private courseService: CoursesService,
    private router: Router,
    private store: Store<RootState>
  ) {
    this.createForm = this.fb.group(formGroup);

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.courseId = Number(params['id']);
        this.isEditing = true;
        this.courseService.getCourse(this.courseId).subscribe((course) => {
          if (course) {
            this.createForm.patchValue({ ...course, id: this.courseId });
          }
        });
      }
    });
  }

  onSubmit(): void {
    const course = this.createForm.getRawValue();
    if (this.isEditing && this.courseId !== null) {
      course.id = String(this.courseId);
    }

    if (this.isEditing) {
      this.store.dispatch(CoursesActions.updateCourse({ course }));
    } else {
      this.courseService.addCourse(course);
    }
    this.createForm.reset();

    this.router.navigate(['dashboard', 'courses']);
  }

  inputValid(inputName: 'title' | 'description' | 'lastServiceDate') {
    return this.createForm.get(inputName)?.valid && this.createForm.get(inputName)?.touched;
  }

  inputInvalid(inputName: 'title' | 'description' | 'lastServiceDate') {
    return (
      this.createForm.get(inputName)?.invalid &&
      this.createForm.get(inputName)?.touched &&
      this.createForm.get(inputName)?.dirty
    );
  }

  getError(inputName: 'title' | 'description' | 'lastServiceDate') {
    if (!this.createForm.get(inputName)?.errors) {
      return null;
    }

    const errors = Object.keys(this.createForm.get(inputName)?.errors as string[]);

    if (errors.length === 0) {
      return null;
    }

    let message = '';

    errors.forEach((error) => {
      switch (error) {
        case 'required':
          message += 'Este campo es requerido';
          break;
        case 'minlength':
          message += 'Este campo debe tener al menos 3 caracteres';
          break;

        default:
          break;
      }
    });

    return message;
  }
}