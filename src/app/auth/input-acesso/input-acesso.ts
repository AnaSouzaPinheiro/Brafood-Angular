import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export type InputType = 'email' | 'senha' | 'nome' | 'confirmarSenha';

@Component({
  selector: 'bra-input-acesso',
  standalone: true,
  templateUrl: './input-acesso.html',
  styleUrls: ['./input-acesso.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputAcesso),
      multi: true,
    },
  ],
})
export class InputAcesso implements OnInit, ControlValueAccessor {
  @Input() type: InputType = 'email';
  @Input() autocomplete: string = 'off';

  @Input() inputId: string = '';
  @Input() name: string = '';

  placeholder: string = '';
  icon: string = '';

  value: string = '';
  onChange = (value: string) => {};
  onTouched = () => {};

  htmlType: 'text' | 'email' | 'password' = 'text';

  ngOnInit() {
    if (!this.inputId) {
      this.inputId = 'input-' + Math.random().toString(36).substring(2, 10);
    }

    if (!this.name) {
      this.name = this.inputId;
    }

    switch (this.type) {
      case 'email':
        this.placeholder = 'E-mail';
        this.icon = 'fa-regular fa-envelope';
        this.autocomplete = 'email';
        this.htmlType = 'email';
        break;
      case 'senha':
        this.placeholder = 'Senha';
        this.icon = 'fa-solid fa-lock';
        this.autocomplete = 'current-password';
        this.htmlType = 'password';
        break;
      case 'nome':
        this.placeholder = 'Nome';
        this.icon = 'fa-regular fa-user';
        this.autocomplete = 'name';
        this.htmlType = 'text';
        break;
      case 'confirmarSenha':
        this.placeholder = 'Confirme sua senha';
        this.icon = 'fa-solid fa-lock';
        this.autocomplete = 'new-password';
        this.htmlType = 'password';
        break;
    }
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  inputChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
