import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faces',
  templateUrl: 'faces.component.html',
  styles: []
})
export class FacesComponent implements OnInit {

  ImagePath: any = [{
    id: 1,
    path: '/assets/subject01-test.gif'
  },
  {
    id: 2,
    path: '/assets/subject02-test.gif'
  }]

get_value(path:string){
  console.log(path)
}
  ngOnInit(): void {
  }

}
