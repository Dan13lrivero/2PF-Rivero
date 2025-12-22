import { Validators } from '@angular/forms';

export const formGroup = {
  id: [''],
  title: ['', [Validators.required, Validators.minLength(3)]],
  description: ['', [Validators.required, Validators.minLength(3)]],
  // Solo la fecha del último service
  lastServiceDate: ['', [Validators.required]],
  // Toggle: true = hecho, false = pendiente
  serviceDone: [false],
};