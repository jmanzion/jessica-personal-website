import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FacesComponent } from './faces/faces.component';
import { ColorCompressionComponent } from './color-compression/color-compression.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FacesComponent,
    ColorCompressionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
