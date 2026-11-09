import { Component, Input, input, output, Optional } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

export type ButtonType =
  | 'normal'
  | 'other'
  | 'another'
  | 'add'
  | 'comment'
  | 'category'
  | 'filter'
  | 'cancel';

@Component({
  selector: 'bra-custom-button',
  standalone: true,
  imports: [NgClass, RouterModule],
  templateUrl: './custom-button.html',
  styleUrl: './custom-button.scss',
})
export class CustomButton {
  label = input('');
  type = input<ButtonType>('normal');
  clicked = output();

  @Input() route?: string;
  @Input() active = false;
  @Input() disabled = false;

  constructor(@Optional() private router: Router) {}

  isActive(): boolean {
    if (!this.router || !this.route) return false;
    return this.router.url === this.route;
  }

  getClasses() {
    return {
      [this.type()]: true,
      active: this.isActive(),
      disabled: this.disabled,
    };
  }

  onClick() {
    if (!this.disabled) this.clicked.emit();
  }
}
