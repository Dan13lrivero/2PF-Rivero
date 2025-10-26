import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentsRoutingModule } from './students-routing-module';
import { Students } from './students';
import { UsersModule } from '../../../users/users-module';


@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    StudentsRoutingModule,
    UsersModule
  ]
})
export class StudentsModule { }
