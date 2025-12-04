import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Student } from '../../../core/models/Student';
import { StudentsService } from '../../../core/services/students/students.service';

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

  constructor(private fb: FormBuilder, private studentsService: StudentsService) {
    this.userForm = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.email]]
    });
  }

  ngOnInit(): void {
    this.sub = this.studentsService.studentEdit$.subscribe((student) => {
      if (student) {
        this.userForm.patchValue({
          id: student.id ?? null,
          nombre: student.nombre ?? '',
          apellido: student.apellido ?? '',
          email: student.email ?? ''
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
      this.studentsService.updateStudent(id, this.userForm.value);
    } else {
      const newStudent: Partial<Student> = {
        nombre: this.userForm.value.nombre,
        apellido: this.userForm.value.apellido,
        email: this.userForm.value.email
      };
      this.studentsService.addStudent(newStudent as Student);
    }

    this.userForm.reset();
    this.isEditing = false;
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
