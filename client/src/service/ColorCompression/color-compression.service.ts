import { Injectable } from '@angular/core';
import { Service } from '../service';

@Injectable()
export class ColorCompressionService extends Service {
  list(): Promise<Object[]> {
    return (this.sendRequest('/_/api/ColorCompression', 'GET') as Promise<Object[]>);
  }
}