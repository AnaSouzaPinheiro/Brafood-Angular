import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { BraInput } from '../../shared/input/input';
import { CustomButton } from '../../shared/custom-button/custom-button';

interface Item {
  title: string;
  subitems: string[];
}

@Component({
  selector: 'bra-input-list',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, BraInput, CommonModule, CustomButton],
  templateUrl: './input-list.html',
  styleUrl: './input-list.scss',
})
export class InputList implements OnInit, OnChanges {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() inType: 'input' | 'textarea' = 'input';
  @Input() maxItems: number = 10;
  @Input() titlePlaceholder: string = '';
  @Input() subitemPlaceholder: string = '';
  @Input() removeLabel: string = '';
  @Input() addLabel: string = '';
  @Input() items: Item[] = [];
  @Input() forceValidate: boolean = false;
  @Input() errorMessage: string = 'Adicione pelo menos um item preenchido.';

  @Output() listChange = new EventEmitter<Item[]>();

  /** Modo de preparo: numera os passos e o × fica dentro do campo. */
  get ehPasso(): boolean {
    return this.inType === 'textarea';
  }

  titleControls: FormControl[] = [];
  subitemControls: FormControl[][] = [];

  ngOnInit() {
    this.ensureStructure();
    this.syncControls();
  }

  ngOnChanges() {
    this.ensureStructure();
    this.syncControls();
  }

  private ensureStructure() {
    if (!this.items || this.items.length === 0) {
      this.items = [{ title: '', subitems: [''] }];
    } else {
      this.items = this.items.map((it) => ({
        title: it.title ?? '',
        subitems: it.subitems && it.subitems.length > 0 ? it.subitems : [''],
      }));
    }
  }

  private syncControls() {
    this.titleControls = this.items.map((i) => new FormControl(i.title));
    this.subitemControls = this.items.map((i) =>
      i.subitems.map((s) => new FormControl(s))
    );
  }

  addItem() {
    this.items.push({ title: '', subitems: [''] });
    this.syncControls();
    this.emitChange();
  }

  removeItem(i: number) {
    this.items.splice(i, 1);
    if (this.items.length === 0) {
      this.items.push({ title: '', subitems: [''] });
    }
    this.syncControls();
    this.emitChange();
  }

  addSubitem(i: number) {
    this.items[i].subitems.push('');
    this.syncControls();
    this.emitChange();
  }

  removeSubitem(i: number, j: number) {
    this.items[i].subitems.splice(j, 1);
    if (this.items[i].subitems.length === 0) {
      this.items[i].subitems.push('');
    }
    this.syncControls();
    this.emitChange();
  }

  updateTitle(i: number, novoValor: string) {
    this.items[i].title = novoValor;
    this.emitChange();
  }

  updateSubitem(i: number, j: number, novoValor: string) {
    this.items[i].subitems[j] = novoValor;
    this.emitChange();
  }

  private emitChange() {
    const clone = this.items.map((it) => ({
      title: it.title,
      subitems: [...it.subitems],
    }));
    this.listChange.emit(clone);
  }

  trackByIndex(index: number) {
    return index;
  }

  get hasNoContent(): boolean {
    return !this.items.some((item) =>
      item.subitems.some((s) => s.trim().length > 0)
    );
  }

  get isInvalid(): boolean {
    return this.forceValidate && this.hasNoContent;
  }
}
