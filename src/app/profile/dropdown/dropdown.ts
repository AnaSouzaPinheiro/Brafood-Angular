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

  @Input() selected: Option[] = [];

  @Output() optionSelected  = new EventEmitter<Option[]>();
  @Output() selectionChange = new EventEmitter<Option[]>();

  isOpen = signal<boolean[]>([false]);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selected']) {
      const incoming = this.selected;

      if (this.multiSelect) {
        // Modo multi: precisa ter ao menos 1 slot para o *ngFor renderizar
        // MAS só insere o slot vazio se não há nenhuma seleção real vinda do pai.
        // Se veio [] vazio, coloca placeholder; se veio com itens, usa os itens.
        if (!incoming || incoming.length === 0) {
          this.selected = [{ label: '', value: '' }];
        }
        // Se veio com valores reais (ex: pré-seleção do edit), não mexe — usa como está.
      }
      // Modo single: não altera o array — o template já trata [] exibindo 'Selecione'.

      // Sincroniza o array de estados de abertura
      const opens = [...this.isOpen()];
      const needed = Math.max(1, this.selected.length);
      while (opens.length < needed) opens.push(false);
      this.isOpen.set(opens.slice(0, needed));
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
