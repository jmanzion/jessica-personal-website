import { Component, OnInit } from '@angular/core';
import {ProgressSpinnerMode} from '@angular/material/progress-spinner';
import { ColorCompressionService } from 'src/service/ColorCompression/color-compression.service';


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
    files: any[] = [];

    progressMode: ProgressSpinnerMode = 'determinate';
    progressValue = 0;

    constructor(private colorCompressionService: ColorCompressionService){ }

    uploadImage(event:any){
      this.files = event.target.files;
      var image = document.getElementById('uploadedFile') as any;
      image.src = URL.createObjectURL(this.files[0]);
    }

    loading(){
      this.spinner = true;
      this.progressMode = 'indeterminate';
    }

    viewImage(){
      this.spinner = false;
      this.progressMode = 'determinate';
      this.showImage = true;
    }
    viewImage2(){
      this.spinner = false;
      this.progressMode = 'determinate';
      this.showImage2 = true;
      this.colorCompressionService.compress(this.files[0],this.numColors2).then((result : any)=> {
        var image = document.getElementById('compressedImage') as any;
        console.log(result);
        image.src = 'data:image/jpeg;base64,' + result.responseText;
      });
    }
    
    resetShowImage(e:number){
      this.showImage = false;
    }
    resetShowImage2(e:number){
      this.showImage2 = false;
    }
  }
  