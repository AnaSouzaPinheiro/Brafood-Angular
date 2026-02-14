import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface DropdownItem {
  id?: number;
  name: string;
  checked: boolean;
}

@Component({
  selector: 'bra-filter-dropdown',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './filter-dropdown.html',
  styleUrl: './filter-dropdown.scss',
})
export class FilterDropdown {
  dropdownOpen = false;

  @Input() type: 'single' | 'multi' = 'single';

  @Input() optionsDropwdown!: {
    labelTitle: string;
    items: DropdownItem[];
  };

  @Output() changeFilter = new EventEmitter<string>();
  @Output() changeMulti = new EventEmitter<number[]>();
  @Output() itemClickedMulti = new EventEmitter<DropdownItem>();

  // Injetar ChangeDetectorRef para garantir que as atualizações visuais ocorram
  constructor() {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  getSelectedText(): string {
    const checkedItems = this.optionsDropwdown.items.filter(
      (item) => item.checked,
    );

    if (this.type === 'single') {
      return checkedItems.length > 0 ? checkedItems[0].name : 'Selecione';
    } else {
      const itemTodas = checkedItems.find((item) => item.id === 0);
      if (itemTodas) return itemTodas.name;

      if (checkedItems.length === 0) return 'Nenhum selecionado';

      // Retorna a contagem, como desejado
      return `${checkedItems.length} selecionados`;
    }
  }

  selectItem(selectedItem: DropdownItem) {
    if (this.type !== 'multi') return;

    const TODAS = 0;

    if (selectedItem.id === TODAS) {
      // clicou em "Todas"
      this.optionsDropwdown.items.forEach((i) => {
        i.checked = i.id === TODAS;
      });
    } else {
      // clicou em uma subcategoria
      this.optionsDropwdown.items.forEach((i) => {
        if (i.id === TODAS) i.checked = false;
      });

      selectedItem.checked = !selectedItem.checked;
    }

    const idsSelecionados = this.optionsDropwdown.items
      .filter((i) => i.checked && i.id !== TODAS)
      .map((i) => i.id!);

    this.changeMulti.emit(idsSelecionados);
  }

  selectSingle(selectedItem: DropdownItem) {
    this.optionsDropwdown.items.forEach((item) => {
      item.checked = item === selectedItem;
    });

    this.changeFilter.emit(selectedItem.name);
    this.dropdownOpen = false;
  }

  selectMulti(selectedItem: DropdownItem) {
    const TODAS = 0;

    if (selectedItem.id === TODAS) {
      this.optionsDropwdown.items.forEach((i) => {
        i.checked = i.id === TODAS;
      });

      this.changeMulti.emit([]);
      return;
    }

    selectedItem.checked = !selectedItem.checked;

    // desmarca "Todas"
    this.optionsDropwdown.items.forEach((i) => {
      if (i.id === TODAS) i.checked = false;
    });

    const selecionados = this.optionsDropwdown.items
      .filter((i) => i.checked && i.id && i.id !== TODAS)
      .map((i) => i.id!);

    // se marcou todas manualmente
    const subcats = this.optionsDropwdown.items.filter(
      (i) => i.id && i.id !== TODAS,
    );
    if (subcats.every((i) => i.checked)) {
      this.optionsDropwdown.items.forEach((i) => {
        i.checked = i.id === TODAS;
      });

      this.changeMulti.emit([]);
      return;
    }

    this.changeMulti.emit(selecionados);
  }
}
