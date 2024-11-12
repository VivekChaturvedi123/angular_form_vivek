import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormBuilderService {
  createFormField(type: string, label: string, placeholder: string, required: boolean) {
    const validators = required ? [Validators.required] : [];
    const control = new FormControl('', validators);
    return { type, label, placeholder, control };
  }
}
