import { NgModel } from '@angular/forms';


import { Observable } from 'rxjs';
import { ValueAccessorBase } from './value.accessor.bas';
import { message } from '../validate/messages';
import { AsyncValidatorArray ,
  ValidatorArray,
  ValidationResult,
  validate, } from '../validate/validate';

export abstract class ElementBase<T> extends ValueAccessorBase<T> {
  protected abstract model: NgModel;


  // we will ultimately get these arguments from @Inject on the derived class
  constructor(private validators: ValidatorArray,
    private asyncValidators: AsyncValidatorArray,
  ) {
    super();
  }

}
