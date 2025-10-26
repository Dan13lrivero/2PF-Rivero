import { Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Users } from './users';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersList } from './components/users-list/users.list';
import { UserForm } from './components/user-form/user-form';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/pipes/shared-modules';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UserServices } from '../services/user-service';




@NgModule({
  declarations: [
    Users,
    UsersList,
    UserForm
  ],
  providers: [
    UserServices
  ],
  imports: [
    SharedModule, CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatButtonModule, MatInputModule, MatToolbarModule, MatSidenavModule
],
  exports: [
    Users,
    UsersList,
    UserForm
  ]
})
export class UsersModule { }
