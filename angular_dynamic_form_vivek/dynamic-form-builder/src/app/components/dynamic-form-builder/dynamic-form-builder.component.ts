import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ValidationRule {
  type: string;
  value: any;
}

interface FieldConfig {
  type: string;
  label: string;
  placeholder?: string;
  options?: string[]; 
  control?: FormControl | FormArray;
  isRequired?: boolean;
  validations?: ValidationRule[];
}

@Component({
  selector: 'app-dynamic-form-builder',
  templateUrl: './dynamic-form-builder.component.html',
  styleUrls: ['./dynamic-form-builder.component.css']
})
export class DynamicFormBuilderComponent {
  dynamicForm: FormGroup;
  fields: FieldConfig[] = [];
  fieldOptionsForm: FormGroup;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.dynamicForm = this.fb.group({});
    this.fieldOptionsForm = this.fb.group({
      type: ['text', Validators.required],
      label: ['', Validators.required],
      placeholder: [''],
      options: [''],
      isRequired: [false],
      validations: this.fb.array([]),
    });
  }

  get validations() {
    return this.fieldOptionsForm.get('validations') as FormArray;
  }

  addValidation() {
    if (this.validations.length < 3) {
      this.validations.push(
        this.fb.group({
          type: [''],
          value: [''],
        })
      );
    } else {
      this.snackBar.open('You can only add up to 3 validations.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  removeValidation(index: number) {
    this.validations.removeAt(index);
  }

  addField(): void {
    const fieldData = this.fieldOptionsForm.value;
    const validators = [];

    if (fieldData.isRequired) validators.push(Validators.required);
    fieldData.validations.forEach((validation: ValidationRule) => {
      if (validation.type === 'minLength') {
        validators.push(Validators.minLength(validation.value));
      }
      if (validation.type === 'maxLength') {
        validators.push(Validators.maxLength(validation.value));
      }
      if (validation.type === 'pattern') {
        validators.push(Validators.pattern(validation.value));
      }
    });

    const newField: FieldConfig = {
      type: fieldData.type,
      label: fieldData.label,
      placeholder: fieldData.placeholder,
      options: fieldData.options ? fieldData.options.split(',') : [],
      isRequired: fieldData.isRequired,
      control: new FormControl('', validators),
      validations: fieldData.validations
    };

    if (fieldData.type === 'checkbox' || fieldData.type === 'radio') {
      newField.control = this.fb.array(
        (newField.options || []).map(() => new FormControl(false)),
        fieldData.isRequired ? Validators.required : null
      );
    }

    this.fields.push(newField);
    this.dynamicForm.addControl(newField.label, newField.control);
    this.fieldOptionsForm.reset({ type: 'text', isRequired: false, validations: [] });
  }

  removeField(index: number): void {
    const field = this.fields[index];
    this.fields.splice(index, 1);
    this.dynamicForm.removeControl(field.label);
  }

  getFormArray(field: FieldConfig): FormArray {
    return this.dynamicForm.get(field.label) as FormArray;
  }

  onCheckboxChange(field: FieldConfig, index: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const control = this.getFormArray(field).at(index); 
    control.setValue(checkbox.checked);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.dynamicForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(field: FieldConfig): string {
    const control = this.dynamicForm.get(field.label);
    if (control && control.errors) {
      if (control.errors['required']) {
        return `${field.label} is required`;
      }
      if (control.errors['minlength']) {
        return `${field.label} must be at least ${control.errors['minlength'].requiredLength} characters long`;
      }
      if (control.errors['maxlength']) {
        return `${field.label} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        return `${field.label} has an invalid format`;
      }
    }
    return '';
  }

  isFieldTypeTextOrTextarea(): boolean {
    const fieldType = this.fieldOptionsForm.get('type')?.value;
    return fieldType === 'text' || fieldType === 'textarea';
  }

  isFieldTypeDropdownOrCheckbox(): boolean {
    const fieldType = this.fieldOptionsForm.get('type')?.value;
    return fieldType === 'dropdown' || fieldType === 'checkbox' || fieldType === 'radio';
  }

  onFieldTypeChange(event: Event): void {
    const selectedType = (event.target as HTMLSelectElement).value;
    if (selectedType === 'dropdown' || selectedType === 'checkbox' || selectedType === 'radio') {
      this.fieldOptionsForm.get('options')?.setValidators([Validators.required]);
    } else {
      this.fieldOptionsForm.get('options')?.clearValidators();
    }
    this.fieldOptionsForm.get('options')?.updateValueAndValidity();
  }

  isValidationDisabled(): boolean {
    const fieldType = this.fieldOptionsForm.get('type')?.value;
    return fieldType === 'dropdown' || fieldType === 'checkbox' || fieldType === 'radio';
  }

  onSubmit(): void {
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });

    if (this.dynamicForm.valid) {
      const formValue = { ...this.dynamicForm.value };

      this.fields.forEach(field => {
        if (field.type === 'checkbox' && field.options) {
          const selectedOptions = field.options.filter((_, index) =>
            (this.dynamicForm.get(field.label) as FormArray).at(index).value
          );
          formValue[field.label] = selectedOptions;
        }
      });

      this.snackBar.open('Form Submitted Successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      console.log('Form Submitted', formValue);
      this.dynamicForm.reset();
      this.fields = [];
    } else {
      this.snackBar.open('Please fill in all required fields.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }
}
