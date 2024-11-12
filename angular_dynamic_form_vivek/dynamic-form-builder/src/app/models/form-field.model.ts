export interface FormField {
    id: string;
    type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio';
    label: string;
    placeholder?: string;
    options?: string[];
    validations: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    };
  }
  