import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { Input as BraInput } from '../../shared/input/input';

interface Item {
  title: string;
  subitems: string[];
}

@Component({
  selector: 'bra-input-list',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, BraInput, CommonModule],
  templateUrl: './input-list.html',
  styleUrl: './input-list.scss',
})
export class InputList {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() inType: 'input' | 'textarea' = 'input';
  @Input() maxItems: number = 10;

  @Output() listChange = new EventEmitter<Item[]>();

  // lista principal com título + subinputs
  items = signal<Item[]>([{ title: '', subitems: [''] }]);

  // controles do título e subitens
  titleControls: FormControl[] = [new FormControl('')];
  subitemControls: FormControl[][] = [[new FormControl('')]];

  addItem() {
    this.items.set([...this.items(), { title: '', subitems: [''] }]);
    this.titleControls.push(new FormControl(''));
    this.subitemControls.push([new FormControl('')]);
  }

  removeItem(index: number) {
    const copy = [...this.items()];
    copy.splice(index, 1);
    this.items.set(copy);
    this.titleControls.splice(index, 1);
    this.subitemControls.splice(index, 1);
    this.listChange.emit(this.items());
  }

  addSubitem(itemIndex: number) {
    const copy = [...this.items()];
    copy[itemIndex].subitems.push('');
    this.items.set(copy);
    this.subitemControls[itemIndex].push(new FormControl(''));
  }

  removeSubitem(itemIndex: number, subIndex: number) {
    const copy = [...this.items()];
    copy[itemIndex].subitems.splice(subIndex, 1);
    this.items.set(copy);
    this.subitemControls[itemIndex].splice(subIndex, 1);
    this.listChange.emit(this.items());
  }

  updateTitle(itemIndex: number, newValue: string) {
    const copy = [...this.items()];
    copy[itemIndex].title = newValue;
    this.items.set(copy);
    this.listChange.emit(copy);
  }

  updateSubitem(itemIndex: number, subIndex: number, newValue: string) {
    const copy = [...this.items()];
    copy[itemIndex].subitems[subIndex] = newValue;
    this.items.set(copy);
    this.listChange.emit(copy);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
