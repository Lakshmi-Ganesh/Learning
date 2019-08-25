import {
  AbstractControl,
  AsyncValidatorFn,
  Validator,
  Validators,
  ValidatorFn,
} from '@angular/forms';


import { Observable } from 'rxjs/';
import { of } from 'rxjs';


export type ValidationResult = { [validator: string]: string | boolean };


export type AsyncValidatorArray = Array<Validator | AsyncValidatorFn>;


export type ValidatorArray = Array<Validator | ValidatorFn>;


const normalizeValidator =
  (validator: Validator | ValidatorFn): ValidatorFn | AsyncValidatorFn => {
    const func = (validator as Validator).validate.bind(validator);
    if (typeof func === 'function') {
      return (c: AbstractControl) => func(c);
    } else {
      return <ValidatorFn | AsyncValidatorFn>validator;
    }
  };


export const composeValidators =
  (validators: ValidatorArray): AsyncValidatorFn | ValidatorFn => {
    if (validators == null || validators.length === 0) {
      return null;
    }
    return Validators.compose(validators.map(normalizeValidator));
  };

export const validate =
  (validators: ValidatorArray, asyncValidators: AsyncValidatorArray) => {
    return (control: AbstractControl) => {
      const synchronousValid = () => composeValidators(validators)(control);
    };
  };
