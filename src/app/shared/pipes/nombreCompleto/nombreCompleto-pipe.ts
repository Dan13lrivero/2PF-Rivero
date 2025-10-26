import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../../../users/interface/User';

@Pipe({
  name: 'nombreCompleto',
  standalone: false
})
export class NombreCompletoPipe implements PipeTransform {
  transform(user: User): string {
    return `${user.nombre.charAt(0).toUpperCase() + user.nombre.slice(1)} ${user.apellido.charAt(0).toUpperCase() + user.apellido.slice(1)}`;
  }
}
