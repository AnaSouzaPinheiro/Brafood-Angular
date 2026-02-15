import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';

export interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'bra-dropdown',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, NgClass],
  templateUrl: './dropdown.html',
  styleUrls: ['./dropdown.scss'],
})
export class Dropdown implements OnChanges {
  @Input() label: string = 'Selecione';
  @Input() options: Option[] = [];
  @Input() multiSelect: boolean = false;
  @Input() maxItems: number = 5;

  // Novo input que substitui o antigo initialSelected
  @Input() selected: Option[] = [];

  @Output() optionSelected = new EventEmitter<Option[]>();
  @Output() selectionChange = new EventEmitter<Option[]>();

  isOpen = signal<boolean[]>([false]);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selected']) {
      // Garante que sempre há ao menos 1 posição no header, mas sem estragar valores vindos do pai
      if (!this.selected || this.selected.length === 0) {
        this.selected = [{ label: '', value: '' }];
      }

      // Garante que o array de "open states" acompanha o número de selecionados
      const opens = [...this.isOpen()];
      while (opens.length < this.selected.length) {
        opens.push(false);
      }
      this.isOpen.set(opens);
    }
  }
  
  toggleDropdown(index: number) {
    const openStates = [...this.isOpen()];
    openStates[index] = !openStates[index];
    this.isOpen.set(openStates);
  }

  selectOption(index: number, option: Option) {
    const current = [...this.selected];

    if (this.multiSelect) {
      current[index] = option;
    } else {
      current[0] = option;
    }

    this.selected = current;

    const openStates = [...this.isOpen()];
    openStates[index] = false;
    this.isOpen.set(openStates);

    this.optionSelected.emit(this.selected);
    this.selectionChange.emit(this.selected);
  }

  addDropdown() {
    if (this.selected.length < this.maxItems) {
      this.selected = [...this.selected, { label: '', value: '' }];
      this.isOpen.set([...this.isOpen(), false]);
    }
  }

  removeDropdown(index: number) {
    const selectedCopy = [...this.selected];
    selectedCopy.splice(index, 1);
    this.selected = selectedCopy;

    const isOpenCopy = [...this.isOpen()];
    isOpenCopy.splice(index, 1);
    this.isOpen.set(isOpenCopy);

    this.selectionChange.emit(this.selected);
  }

  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isOpen.set(this.isOpen().map(() => false));
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  isSelected(option: Option): boolean {
    return this.selected.some((o) => o.value === option.value);
  }
}
