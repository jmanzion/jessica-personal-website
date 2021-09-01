import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, RequiredValidator} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  templateUrl: 'contact.component.html',
  styles: [
  ]
})
export class ContactComponent implements OnInit {
  contactForm = new FormGroup({
    subject: new FormControl(''),
    message: new FormControl('')
  });

  constructor() {} 
  ngOnInit() { }
  processForm(contactForm: FormGroup) {
    var subject = this.contactForm.controls['subject'].value;
    var message = this.contactForm.controls['message'].value;
    window.open("mailto:jessmanzione101@gmail.com?subject=" + subject + "&body=" + message,"_blank");
  }
}
