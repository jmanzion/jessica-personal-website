import { Component, OnInit } from '@angular/core';
import {ProgressSpinnerMode} from '@angular/material/progress-spinner';


@Component({
    selector: 'app-color-compression',
    templateUrl: 'color-compression.component.html',
    styles: []
  })
  export class ColorCompressionComponent{
    
    showImage : boolean = false;
    showImage2 : boolean = false;
    numColors : number = 5;
    numColors2 : number = 5;
    compressImage : string = 'images/fox.bmp';
    spinner : boolean = false;
    filename: string = '';

    progressMode: ProgressSpinnerMode = 'determinate';
    progressValue = 0;

    loading(){
      this.spinner = true;
      this.progressMode = 'indeterminate'
    }

    viewImage(){
      this.spinner = false;
      this.progressMode = 'determinate'
      this.showImage = true;
    }
    viewImage2(){
      this.spinner = false;
      this.progressMode = 'determinate'
      this.showImage2 = true;
    }
    
    resetShowImage(e:number){
      this.showImage = false;
    }
    resetShowImage2(e:number){
      this.showImage2 = false;
    }
  }
  