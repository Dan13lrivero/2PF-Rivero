import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard';
import { SharedModule } from '../../shared/shared-module';
import { Home } from './home/home';
import { UsersModule } from '../../users/users-module';


@NgModule({
  declarations: [
    Dashboard,
    Home
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    UsersModule
  ]
})
export class DashboardModule { }
