
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProducerListComponent } from './producer-list/producer-list.component';
import { ProducerFormComponent } from './producer-form/producer-form.component';
import { DashboardComponent } from './dashboard/dashboard.component'; 

const routes: Routes = [
  { path: '', redirectTo: '/producers', pathMatch: 'full' }, 
  { path: 'producers', component: ProducerListComponent },
  { path: 'producers/new', component: ProducerFormComponent },
  { path: 'producers/edit/:id', component: ProducerFormComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/producers' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }