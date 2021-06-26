import { ThisReceiver, ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  goFaces(){
    this.router.navigate(['/faces']);
  }

  goToColorCompression(){
    this.router.navigate(['/color-compression'])
  }

  ngOnInit(): void {
  }

}
