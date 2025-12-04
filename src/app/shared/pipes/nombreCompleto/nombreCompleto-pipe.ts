import { Pipe, PipeTransform } from '@angular/core';
import { Student } from '../../../core/models/Student'; 

@Pipe({
  name: 'nombreCompleto',
  standalone: false
})
export class NombreCompletoPipe implements PipeTransform {
  transform(student: Student): string { 
    return `${student.nombre.charAt(0).toUpperCase() + student.nombre.slice(1)} ${student.apellido.charAt(0).toUpperCase() + student.apellido.slice(1)}`;
  }
}