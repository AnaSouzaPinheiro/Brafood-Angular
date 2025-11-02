import { Component, Input } from '@angular/core';
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

  @Input() optionsDropwdown!: {
    labelTitle: string;
    items: { name: string; checked: boolean }[];
  };

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectItem(selectedItem: any) {
    this.optionsDropwdown.items.forEach((item) => (item.checked = false));
    selectedItem.checked = true;
  }

  getSelectedText(): string {
    return this.optionsDropwdown.items.find((i) => i.checked)?.name ?? '';
  }
}
