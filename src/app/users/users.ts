import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { User } from './interface/User'; 
import { MatTableDataSource } from '@angular/material/table';
import { UserServices } from '../services/user-service';


@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users {
  nombre: string = "";
  apellido: string = "";
  edad: number = 30;
  usersList: User[] = [];
  userToEdit: User | null = null;

  h1Style = 'font-size: 25px; color: red;'

  constructor(private userService: UserServices) {
  }

  onAddUser(user: User) {
    console.log(user);
    this.userService.addUser(user);

}

onEditUser(user: User) {
  this.userToEdit = user;
}

onEditRecieved(user: User) {
  let response = this.userService.updateUser(user.id, user);
  
  if( response) {
    this.userToEdit = null;
  }
  
}

}
