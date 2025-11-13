import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

export type inType = 'input' | 'textarea';

@Component({
  selector: 'bra-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BraInput), // mudar aqui também
      multi: true,
    },
  ],
})
export class BraInput implements OnInit, ControlValueAccessor {
  // <--- aqui
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() inType: inType = 'input';
  @Input() autocomplete: string = 'off';

  @Output() valueChange = new EventEmitter<string>();

  value = '';

  private _onChange?: (value: string) => void;
  private _onTouched?: () => void;

  @Input() inputId: string = '';
  @Input() name: string = '';

  ngOnInit(): void {
    if (!this.inputId) {
      this.inputId = 'input-' + Math.random().toString(36).substring(2, 10);
    }

    if (!this.name) {
      this.name = this.inputId; // default name = inputId
    }
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this._onChange?.(value);
    this.valueChange.emit(value);
  }
}
