import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: 'contact.component.html',
  styles: [
  ]
})
export class ContactComponent implements OnInit {

  FormData: FormGroup;

  constructor(private builder:FormBuilder) { 
    ngOnInit() {
      this.FormData = this.builder.group({
      Fullname: new FormControl('', [Validators.required]),
      Email: new FormControl('', [Validators.compose([Validators.required, Validators.email])]),
      Comment: new FormControl('', [Validators.required])
      })
  }

  ngOnInit(): void {
  }

}
