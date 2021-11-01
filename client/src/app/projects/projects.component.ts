import { Component, OnInit } from '@angular/core';
import { html } from 'd3-fetch';

export interface Tile{
  cols: number,
  name: string,
  description: string,
  link: string,
  image: string
}

@Component({
  selector: 'app-projects',
  templateUrl: 'projects.component.html',
  styles: [
  ]
})
export class ProjectsComponent implements OnInit {
  tiles: Tile[] = [
    {name: "", description: "", link: "", image: "assets/kmeans_data.png", cols: 2},
    {name: "K Means Color Compression", description: "Reduce the number of colors in an image using k means clustering.", image: "", link: "/color-compression", cols: 2},
    {image: "assets/d3visuals.png", name: "", description: "", link: "", cols: 2},
    {name: "D3 Visualizations", description: "Various visualizations using D3 including Choropleth map, Force-directed graph, and line charts.", link: "/d3-visuals", image: "", cols: 2}
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
