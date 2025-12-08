import { Component, Input, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

export type ButtonType =
  | 'normal'
  | 'other'
  | 'another'
  | 'add'
  | 'comment'
  | 'category'
  | 'filter';

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
  @Input() route?: string;  // rota que o botão representa
  clicked = output();
  @Input() active = false; 

  constructor(private router: Router) {}

  // retorna true se a rota atual for a mesma do botão
  isActive(): boolean {
    return this.router.url === this.route;
  }

  getClasses() {
    return {
      [this.type()]: true,
      active: this.isActive(),
    };
  }

  onClick() {
    this.clicked.emit();
  }
}
