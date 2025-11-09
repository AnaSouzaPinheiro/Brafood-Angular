import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Perfil } from '../../profile/perfil/perfil';
import { InputImages } from '../../profile/input-images/input-images';
import { Input } from '../../shared/input/input';
import { Dropdown } from '../../profile/dropdown/dropdown';
import { InputList } from '../../profile/input-list/input-list';
import { Receita } from '../../model/receita';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Categoria, Subcategoria } from '../../model/categoria';
import { CategoriaService } from '../../services/categoria';
import { Option } from '../../profile/dropdown/dropdown';

@Component({
  selector: 'bra-add-recipe',
  imports: [
    Perfil,
    InputImages,
    Input,
    Dropdown,
    InputList,
    CustomButton,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './add-recipe.html',
  styleUrl: './add-recipe.scss',
})
export class AddRecipe {
  form: FormGroup;

  categorias: Categoria[] = [];
  categoriasDropdown: Option[] = [];
  categoriasSelecionadas: Option[] = [];
  subcategoriasPorCategoria: { [nome: string]: Option[] } = {};

  receita: Receita = {
    id: 0,
    titulo: '',
    categoria: '',
    dificuldade: 0,
    tempo_preparo: 0,
    tipo_tempo: '',
    porcoes: 0,
    tipo_porcao: '',
    imagem1: '',
    imagem2: '',
    imagem3: '',
    qtd_fav: 0,
    data_criacao: '',
    autor: '',
    ingredientes: [{ titulo: '', itens: [] }],
    etapas: [{ titulo: '', ordem: 1, descricoes: [] }],
  };

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      resumo: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.carregarCategorias();
  }

  carregarCategorias() {
    this.categoriaService.listCats().subscribe({
      next: (res: Categoria[]) => {
        this.categorias = res;

        // Transformar Categoria[] em Option[]
        this.categoriasDropdown = res.map((cat) => ({
          label: cat.nome,
          value: cat.id.toString(), // sempre string, porque Option.value é string
        }));

        // Subcategorias também como Option[]
        res.forEach((cat) => {
          this.subcategoriasPorCategoria[cat.id] = (cat.subcategorias || [])
            .filter((sub) => sub.nome !== 'Todas') // filtra exatamente "Todas"
            .map((sub) => ({
              label: sub.nome,
              value: sub.id.toString(),
            }));
        });
      },
      error: (err: any) => console.error(err),
    });
  }

  // ========== Categorias ==========
  onCategoriaSelecionada(event: Option[]) {
    this.categoriasSelecionadas = event; // já é Option[], perfeito
  }

  // ========== Ingredientes ==========
  adicionarGrupoIngrediente() {
    this.receita.ingredientes.push({ titulo: '', itens: [] });
  }

  removerGrupoIngrediente(i: number) {
    this.receita.ingredientes.splice(i, 1);
  }

  onListChangeIngrediente(i: number, lista: any[]) {
    // converte [{value: string}] -> string[]
    this.receita.ingredientes[i].itens = lista.map(
      (item) => item.value ?? item
    );
  }

  // ========== Etapas ==========
  adicionarEtapa() {
    const ordem = this.receita.etapas.length + 1;
    this.receita.etapas.push({ titulo: '', ordem, descricoes: [] });
  }

  removerEtapa(i: number) {
    this.receita.etapas.splice(i, 1);
  }

  onListChangeEtapa(j: number, lista: any[]) {
    // converte [{value: string}] -> {descricao, ordem}
    this.receita.etapas[j].descricoes = lista.map((item, k) => ({
      descricao: item.value ?? item,
      ordem: k + 1,
    }));
  }

  // ========== Salvar ==========
  salvar() {
    if (this.form.invalid) {
      console.warn('Formulário inválido');
      return;
    }

    const receitaPronta: Receita = {
      ...this.receita,
      titulo: this.form.value.titulo,
      // aqui você pode incluir mais campos do form se houver
    };

    console.log('Receita final pronta pro backend:', receitaPronta);
  }
}
