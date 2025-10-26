import { Component, OnInit } from '@angular/core';
import { User } from '../../../users/interface/User';
import { UserServices } from '../../../services/user-service';
import { CommonModule } from '@angular/common';
import { UsersList } from '../../../users/components/users-list/users.list';
import { UserForm } from '../../../users/components/user-form/user-form';
import { UsersModule } from '../../../users/users-module';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, UsersModule],
  templateUrl: './students.html',
  styleUrls: ['./students.css']
})
export class Students implements OnInit {
  usersList: User[] = []; 

  constructor(private userService: UserServices) {}

  ngOnInit(): void {
    this.userService.users$.subscribe(users => this.usersList = users);
    this.userService.getUsers();
  }
}
