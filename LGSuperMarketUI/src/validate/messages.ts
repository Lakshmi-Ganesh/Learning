import { ValidationResult } from './validate';
export const message = (validator: ValidationResult, key: string): string => {
  switch (key) {
    case 'required':
      return 'Please enter a value';
    case 'pattern':
      return 'Value does not match required pattern';
    case 'minlength':
      return 'Value must be N characters';
    case 'maxlength':
      return 'Value must be a maximum of N characters';
  }


  switch (typeof validator[key]) {
    case 'string':
      return <string>validator[key];
    default:
      return `Validation failed: ${key}`;
  }
};
