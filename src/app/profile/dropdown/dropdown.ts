import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';

export interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'bra-dropdown',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, NgClass], // Adicione as diretivas que você usa no template aqui
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
})
export class Dropdown {
  @Input() label: string = 'Selecione';
  @Input() options: Option[] = [];

  @Input() multiSelect: boolean = false;
  @Input() maxItems: number = 5;

  @Output() optionSelected = new EventEmitter<string | string[]>();

  isOpen = signal<boolean[]>([false]);
  selected = signal<string[]>(['']);

  toggleDropdown(index: number) {
    const openStates = [...this.isOpen()];
    openStates[index] = !openStates[index];
    this.isOpen.set(openStates);
  }

  selectOption(index: number, option: Option) {
    const current = [...this.selected()];
    current[index] = option.label;
    this.selected.set(current);

    const openStates = [...this.isOpen()];
    openStates[index] = false;
    this.isOpen.set(openStates);

    if (this.multiSelect) {
      this.optionSelected.emit(current);
    } else {
      this.optionSelected.emit(option.value);
    }
  }

  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isOpen.set(this.isOpen().map(() => false));
    }
  }

  addDropdown() {
    if (this.selected().length < this.maxItems) {
      this.selected.set([...this.selected(), '']);
      this.isOpen.set([...this.isOpen(), false]);
    }
  }

  removeDropdown(index: number) {
    const selectedCopy = [...this.selected()];
    selectedCopy.splice(index, 1);
    this.selected.set(selectedCopy);

    const isOpenCopy = [...this.isOpen()];
    isOpenCopy.splice(index, 1);
    this.isOpen.set(isOpenCopy);

    this.optionSelected.emit(this.selected());
  }
}
