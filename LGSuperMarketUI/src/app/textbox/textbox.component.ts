import { Component, OnInit, Optional, Inject, Input, ViewChild, EventEmitter, Output, OnChanges } from '@angular/core';
import { ElementBase } from '../../accessor/element.base';
import {
  NgModel,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  NG_ASYNC_VALIDATORS,
} from '@angular/forms';
@Component({
  selector: 'app-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.css'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: TextboxComponent, multi: true }
  ]
})
export class TextboxComponent extends ElementBase<string> implements OnInit, OnChanges {
  @Input()
  public label: any;

  @Input()
  public class: any;

  @Input() public labelhidden: boolean;

  @Input()
  public isautocomplete: any;

  @Input()
  public type: String = 'text';

  @Input()
  public readonly: String;

  @Input()
  public columnformat: string;

  @Input()
  public maxLength: number;

  @Input()
  public required: boolean;

  @ViewChild(NgModel)
  model: NgModel;
  @Input()
  public validationMessage: String;

  @Input()
  public lookupname: String;

  public List: Array<Object> = new Array<Object>();

  @Output() public changeevent = new EventEmitter<Object>();

  @Output() public inputevent = new EventEmitter<Object>();

  constructor(
    @Optional()
    @Inject(NG_VALIDATORS)
    validators: Array<any>,
    @Optional()
    @Inject(NG_ASYNC_VALIDATORS)
    asyncValidators: Array<any>
  ) {
    super(validators, asyncValidators);
  }
  ngOnChanges(changes: any) {

  }
  ngOnInit() { }

  public onBlurMethod(showError: any): boolean {
    this.validationMessage = '';
    if (
      ((this.required && this.required[0] === true) ||
        this.required === true) &&
      (this.value === undefined || this.value === null || !this.value)
    ) {
      if (showError) {
        this.validationMessage = (this.label + ' is required');
        return false;
      }
    } else if (this.value && this.columnformat) {
      if (this.value.match(this.columnformat) == null) {
        if (showError) {
          this.validationMessage = ('Enter Valid ' + this.label);
        }
        return false;
      }
    }
    this.changeevent.emit(this.value);
    return true;
  }

  public onInput(data: any) {

    this.inputevent.emit(data);
  }
}





