import { Component, OnInit } from '@angular/core';

declare function run_choropleth(): any;
declare function run_node(): any;
declare function run_line(): any;

@Component({
  selector: 'app-d3-visuals',
  templateUrl: 'd3-visuals.component.html',
  styles: [
  ]
})
export class D3VisualsComponent implements OnInit {
  constructor() { 
  }

  ngOnInit() {
      run_choropleth();
      run_node();
      run_line();
}
}
