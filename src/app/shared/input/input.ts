import {
  Component,
  forwardRef,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

export type inType = 'input' | 'textarea';

@Component({
  selector: 'bra-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
})
export class Input implements OnInit, ControlValueAccessor {
  value: string | undefined;

  label = input('');
  type = input('text');
  placeholder = input('');
  valueChange = output<string>();
  control: FormControl = new FormControl('');
  inputId = signal('');
  inType = input<inType>('input');

  text = '';

  private _onChange?: (value: string) => void;
  private _onTouched?: () => void;

  getClasses() {
    return {
      [this.type()]: true,
    };
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setDisabledState?(isDisabled: boolean): void {
    // opcional
  }

  onInput() {
    this._onChange?.(this.control.value);
  }

  ngOnInit(): void {
    this.inputId.set('input-' + Math.random().toString(36).substring(2, 10));
  }
}
