import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NombreCompletoPipe } from './nombreCompleto/nombreCompleto-pipe';

@NgModule({
  declarations: [
    NombreCompletoPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NombreCompletoPipe
  ]
})
export class SharedModule { }