import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard';
import { SharedModule } from '../../shared/shared-module';
import { Home } from './home/home';
import { UsersModule } from '../../users/users-module';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    Dashboard,
    Home
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    UsersModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule
  ]
})
export class DashboardModule { }
