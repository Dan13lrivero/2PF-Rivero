import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Student } from '../../../../../core/models/Student';
import { Store } from '@ngrx/store';
import { RootState } from '../../../../../core/store';
import { StudentsActions } from '../../../../../core/store/students/students.actions';
import { selectStudentEdit } from '../../../../../core/store/students/students.selectors';

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.css']
})
export class UserForm implements OnInit, OnDestroy {
  public userForm: FormGroup;
  isEditing: boolean = false;
  private sub!: Subscription;

  constructor(
    private fb: FormBuilder, 
    private store: Store<RootState>
  ) {
    this.userForm = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.email]],
      ci: ['']
    });
  }

  ngOnInit(): void {
    this.sub = this.store.select(selectStudentEdit).subscribe((student) => {
      if (student) {
        this.userForm.patchValue({
          id: student.id ?? null,
          nombre: student.nombre ?? '',
          apellido: student.apellido ?? '',
          email: student.email ?? '',
          ci: student.ci ?? ''
        });
        this.isEditing = true;
      } else {
        this.isEditing = false;
        this.userForm.reset();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      alert('Los campos deben ser validos');
      return;
    }

    if (this.isEditing) {
      const id = this.userForm.value.id;
      this.store.dispatch(
        StudentsActions.updateStudent({ 
          id, 
          student: this.userForm.value 
        })
      );
    } else {
      const newStudent: Partial<Student> = {
        nombre: this.userForm.value.nombre,
        apellido: this.userForm.value.apellido,
        email: this.userForm.value.email,
        ci: this.userForm.value.ci
      };
      this.store.dispatch(
        StudentsActions.addStudent({ student: newStudent as Student })
      );
    }

    this.userForm.reset();
    this.isEditing = false;
    this.store.dispatch(StudentsActions.clearStudentEdit());
  }

  get isNombreInvalid(): boolean {
    const c = this.userForm.controls['nombre'];
    return c.dirty && c.invalid;
  }

  get isApellidoInvalid(): boolean {
    const c = this.userForm.controls['apellido'];
    return c.dirty && c.invalid;
  }

  get isEmailInvalid(): boolean {
    const c = this.userForm.controls['email'];
    return c.dirty && c.invalid;
  }
}