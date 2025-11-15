import { Component, EventEmitter, Input, Output, ViewChild  } from '@angular/core';
import { User } from '../../interface/User'
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { UserServices } from '../../../core/services/user-service';
import { ActivationStart } from '@angular/router';
 
@Component({
  selector: 'user-list',
  standalone: false,
  templateUrl: './users-list.html',
  styleUrls: ['./user-list.css']
})
export class UsersList {
  @Input() users: User[] = [];

  displayedColumns: string[] = ['nombreCompleto', 'email', 'actions']
  dataSource = new MatTableDataSource<User>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userService: UserServices) {
    this.userService.users$.subscribe((users) => {
      this.dataSource.data = users;
    })
  }

  

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.userService.getUsers();
  }

    onEditUser(id: number) {
      this.userService.setUpdateUser(id);
    }
    onDeleteUser(id: number) {
      this.userService.deleteUser(id);
    }
}
