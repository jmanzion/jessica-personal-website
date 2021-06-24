import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacesComponent } from './faces/faces.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'faces', component: FacesComponent},
  //{path: "*", component: AppComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
