import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type InputType = 'email' | 'senha' | 'nome' | 'confirmarSenha' | 'apelido';

@Component({
  selector: 'bra-input-acesso',
  standalone: true,
  imports: [CommonModule],
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
  /** Erro vindo de fora (ex.: servidor disse que o apelido já está em uso) */
  @Input() externalError: string | null = null;

  placeholder: string = '';
  icon: string = '';

  value: string = '';
  touched = false;

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
      case 'apelido':
        this.placeholder = 'Apelido (seu @ no BraFood)';
        this.icon = 'fa-solid fa-user';
        this.autocomplete = 'username';
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
  }

  onBlur() {
    this.touched = true;
    this.onTouched();
  }

  markAsTouched() {
    this.touched = true;
  }

  get errorMessage(): string {
    if (this.externalError) return this.externalError;
    if (!this.touched) return '';

    switch (this.type) {
      case 'email':
        if (!this.value.trim()) return 'Informe seu e-mail.';
        if (!this.isValidEmail(this.value)) return 'E-mail inválido.';
        break;
      case 'nome':
        if (!this.value.trim()) return 'Informe seu nome.';
        if (this.value.trim().length < 2) return 'Nome muito curto.';
        break;
      case 'senha':
        if (!this.value) return 'Informe sua senha.';
        if (this.value.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
        break;
      case 'confirmarSenha':
        if (!this.value) return 'Confirme sua senha.';
        break;
      case 'apelido':
        if (!this.value.trim()) return 'Informe um apelido.';
        break;
    }

    return '';
  }

  get isInvalid(): boolean {
    return (this.touched || !!this.externalError) && this.errorMessage.length > 0;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
