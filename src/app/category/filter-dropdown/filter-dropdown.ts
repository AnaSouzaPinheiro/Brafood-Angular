import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'bra-filter-dropdown',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-dropdown.html',
  styleUrl: './filter-dropdown.scss',
})
export class FilterDropdown {
  dropdownOpen = false;

  @Output() change = new EventEmitter<{ id: number; name: string }>();

  @Input() optionsDropwdown!: {
    labelTitle: string;
    items: { name: string; checked: boolean }[];
  };

  @Output() changeFilter = new EventEmitter<string>();

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectItem(selectedItem: any) {
    this.optionsDropwdown.items.forEach((item) => (item.checked = false));
    selectedItem.checked = true;

    // 🔥 EMITE o valor escolhido
    this.changeFilter.emit(selectedItem.name);
  }

  getSelectedText(): string {
    return this.optionsDropwdown.items.find((i) => i.checked)?.name ?? '';
  }

  selecionar(item: { id: number; name: string }) {
    this.change.emit(item);
  }
}
