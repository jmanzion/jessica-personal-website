import { Injectable } from '@angular/core';
import { Service } from '../service';

@Injectable()
export class ColorCompressionService extends Service {
  compress(file:File,numColors:number): Promise<Object> {
    let formData = new FormData();
    formData.append('file', file);
    return (this.sendRequest("/_/api/ColorCompression?num_colors=" + numColors, 'POST', formData) as Promise<Object>);
  }
}