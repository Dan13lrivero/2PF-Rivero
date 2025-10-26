import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalizePipe } from './capitalize/capitalize-pipe';
import { Resaltado } from '../directives/resaltado';
import { NombreCompletoPipe } from '../pipes/nombreCompleto/nombreCompleto-pipe';



@NgModule({
  declarations: [
    CapitalizePipe,
    Resaltado,
    NombreCompletoPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CapitalizePipe, Resaltado, NombreCompletoPipe
  ]
})
export class SharedModule { }
