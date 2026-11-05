import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ControlContainer, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { Dropdown, Option } from '../../profile/dropdown/dropdown';

/**
 * Campos de Dificuldade / Tempo de preparo / Porções do formulário de
 * receita (usado em adicionar e editar receita).
 *
 * Usa os controles do formulário do componente pai:
 * dificuldade, tempo_hora, tempo_min, porcoes e tipo_porcao.
 */
@Component({
  selector: 'bra-recipe-meta-fields',
  imports: [ReactiveFormsModule, Dropdown],
  templateUrl: './recipe-meta-fields.html',
  styleUrl: './recipe-meta-fields.scss',
  // Faz os formControlName daqui se ligarem ao [formGroup] do pai
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class RecipeMetaFields {
  @Input() porcoesDropdown: Option[] = [];
  @Input() porcaoSelecionada: Option[] = [];
  @Input() tentouEnviar = false;
  @Output() porcaoChange = new EventEmitter<Option[]>();

  private container = inject(ControlContainer);

  readonly dificuldades = [
    { valor: 1, rotulo: 'Fácil', icone: '●○○' },
    { valor: 2, rotulo: 'Médio', icone: '●●○' },
    { valor: 3, rotulo: 'Difícil', icone: '●●●' },
  ];

  // 0 a 24 h, depois 36, 48 e 72 h para receitas com descanso longo
  // (fermentação, marinada...). Detalhes ficam no modo de preparo.
  readonly horas = [...Array.from({ length: 25 }, (_, i) => i), 36, 48, 72];
  readonly minutosBase = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5 ... 55

  readonly PORCOES_MIN = 1;
  readonly PORCOES_MAX = 50;

  get form(): FormGroup {
    return this.container.control as FormGroup;
  }

  /** Inclui um valor "quebrado" já salvo (ex.: 7 min vindo da IA) na lista */
  get minutos(): number[] {
    const atual = Number(this.form.get('tempo_min')?.value);
    return Number.isInteger(atual) && atual >= 0 && atual <= 59 && !this.minutosBase.includes(atual)
      ? [...this.minutosBase, atual].sort((a, b) => a - b)
      : this.minutosBase;
  }

  get horasOpcoes(): number[] {
    const atual = Number(this.form.get('tempo_hora')?.value);
    return Number.isInteger(atual) && atual >= 0 && !this.horas.includes(atual)
      ? [...this.horas, atual].sort((a, b) => a - b)
      : this.horas;
  }

  selecionarDificuldade(valor: number) {
    const ctrl = this.form.get('dificuldade');
    ctrl?.setValue(valor);
    ctrl?.markAsTouched();
  }

  alterarPorcoes(delta: number) {
    const ctrl = this.form.get('porcoes');
    const atual = Number(ctrl?.value) || 0;
    const novo = Math.min(this.PORCOES_MAX, Math.max(this.PORCOES_MIN, atual + delta));
    ctrl?.setValue(novo);
    ctrl?.markAsTouched();
  }

  invalido(nome: string): boolean {
    const c = this.form.get(nome);
    return !!c && c.invalid && (c.touched || this.tentouEnviar);
  }

  /** Tempo total precisa ser maior que zero */
  get tempoZerado(): boolean {
    const h = Number(this.form.get('tempo_hora')?.value) || 0;
    const m = Number(this.form.get('tempo_min')?.value) || 0;
    const tocado = this.form.get('tempo_hora')?.touched || this.form.get('tempo_min')?.touched;
    return (tocado || this.tentouEnviar) && h === 0 && m === 0
      && this.form.get('tempo_hora')?.value !== null && this.form.get('tempo_min')?.value !== null;
  }
}
