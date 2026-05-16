import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';

export type inType = 'input' | 'textarea';

const DEFAULT_ERRORS: Record<string, string> = {
  required: 'Este campo é obrigatório.',
  email: 'Informe um e-mail válido.',
  minlength: 'Texto muito curto.',
  maxlength: 'Texto muito longo.',
  min: 'Valor abaixo do permitido.',
  max: 'Valor acima do permitido.',
  pattern: 'Formato inválido.',
};

@Component({
  selector: 'bra-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class BraInput implements OnInit, ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() inType: inType = 'input';
  @Input() autocomplete: string = 'off';
  @Input() value: string | null = null;
  @Input() maxChars: number | null = null;
  @Input() errorMessages: Record<string, string> = {};

  @Output() valueChange = new EventEmitter<string>();

  private _onChange?: (value: string) => void;
  private _onTouched?: () => void;

  @Input() inputId: string = '';
  @Input() name: string = '';

  private ngControl = inject(NgControl, { optional: true, self: true });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    if (!this.inputId) {
      this.inputId = 'input-' + Math.random().toString(36).substring(2, 10);
    }
    if (!this.name) {
      this.name = this.inputId;
    }
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  setDisabledState(_: boolean): void {}

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this._onChange?.(value);
    this.valueChange.emit(value);
  }

  onBlur(): void {
    this._onTouched?.();
  }

  // Validação inline
  get isInvalid(): boolean {
    const ctrl = this.ngControl?.control;
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  get errorMessage(): string {
    const errors = this.ngControl?.control?.errors;
    if (!errors) return '';

    const key = Object.keys(errors)[0];

    if (key === 'minlength') {
      const required = errors['minlength']?.requiredLength;
      return (
        this.errorMessages['minlength'] ??
        `Mínimo de ${required} caractere${required !== 1 ? 's' : ''}.`
      );
    }
    if (key === 'maxlength') {
      const required = errors['maxlength']?.requiredLength;
      return (
        this.errorMessages['maxlength'] ??
        `Máximo de ${required} caractere${required !== 1 ? 's' : ''}.`
      );
    }

    return this.errorMessages[key] ?? DEFAULT_ERRORS[key] ?? 'Campo inválido.';
  }

  get charCount(): number {
    return (this.value ?? '').length;
  }

  get nearLimit(): boolean {
    if (!this.maxChars) return false;
    return this.charCount >= this.maxChars * 0.85;
  }

  get overLimit(): boolean {
    if (!this.maxChars) return false;
    return this.charCount > this.maxChars;
  }
}
