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
import { BraInput } from '../../shared/input/input';
import { Dropdown } from '../../profile/dropdown/dropdown';
import { InputList } from '../../profile/input-list/input-list';
import { Receita } from '../../model/receita';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Categoria } from '../../model/categoria';
import { CategoriaService } from '../../services/categoria';
import { Option } from '../../profile/dropdown/dropdown';
import { MyRecipesService } from '../../services/my-recipes';

@Component({
  selector: 'bra-add-recipe',
  imports: [
    Perfil,
    InputImages,
    BraInput,
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
  subcategoriasSelecionadas: { [catId: string]: Option[] } = {};
  subcategoriasPorCategoria: { [nome: string]: Option[] } = {};

  porcoesDropdown: Option[] = [
    {
      label: 'Porções',
      value: 'Porções',
    },
    {
      label: 'Pedaços',
      value: 'Pedaços',
    },
    {
      label: 'Pratos',
      value: 'Pratos',
    },
    {
      label: 'Fatias',
      value: 'Fatias',
    },
    {
      label: 'Unidades',
      value: 'Unidades',
    },
  ];
  porcaoSelecionada: Option[] = [];

  receita: Receita = {
    id: 0,
    titulo: '',
    resumo: '',
    categoria: '',
    subcategoria: '',
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

  imagensSelecionadas: File[] = [];

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private myRecipesService: MyRecipesService
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      resumo: ['', Validators.required],
      categoriasSelecionadas: [[], Validators.required],
      dificuldade: [
        null,
        [Validators.required, Validators.min(1), Validators.max(3)],
      ],
      tempo_preparo: [null, Validators.required],
      tipo_tempo: ['', Validators.required],
      porcoes: [null, Validators.required],
      tipo_porcao: ['', Validators.required],
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
    this.categoriasSelecionadas = event;
    this.receita.categoria = event.map((e) => e.value).join(','); // ou armazene como array
  }

  onSubcategoriaSelecionada(catId: string, selecionadas: Option[]) {
    this.subcategoriasSelecionadas[catId] = selecionadas;
  }

  // ========== Porções ==========
  onPorcaoSelecionada(event: Option[]) {
    if (event.length) {
      this.receita.tipo_porcao = event[0].value;
      this.form.patchValue({ tipo_porcao: event[0].value });
    }
  }

  onImagensSelecionadas(files: File[]) {
    this.imagensSelecionadas = files;
  }

  get ingredientesComoItems() {
    return this.receita.ingredientes.map((ing) => ({
      title: ing.titulo ?? '',
      subitems: ing.itens ?? [''],
    }));
  }

  get etapasComoItems() {
    return this.receita.etapas.map((et) => ({
      title: et.titulo ?? '',
      subitems: et.descricoes?.map((d: any) => d.descricao) ?? [''],
    }));
  }

  // ========== Ingredientes ==========
  atualizarIngredientes(lista: any[]) {
    this.receita.ingredientes = lista.map((ing: any) => ({
      titulo: ing.title,
      itens: ing.subitems,
    }));
  }

  // ========== Etapas ==========
  atualizarEtapas(lista: any[]) {
    this.receita.etapas = lista.map((etapa: any, i: number) => ({
      titulo: etapa.title,
      ordem: i + 1,
      descricoes: etapa.subitems.map((desc: string, j: number) => ({
        descricao: desc,
        ordem: j + 1,
      })),
    }));
  }

  // ========== Salvar ==========
  salvar() {
    const categoriaSelecionada = this.categoriasSelecionadas[0]; // pega a primeira categoria selecionada
    const subcategoriaSelecionada =
      this.subcategoriasSelecionadas[categoriaSelecionada?.value]?.[0]; // primeira subcategoria

    const receitaPronta = {
      ...this.receita,
      titulo: this.form.value.titulo,
      resumo: this.form.value.resumo,
      categoria: this.categoriasSelecionadas[0]?.label ?? '',
      subcategoria:
        this.subcategoriasSelecionadas[
          this.categoriasSelecionadas[0]?.value
        ]?.[0]?.label ?? '',
      dificuldade: this.form.value.dificuldade,
      tempo_preparo: this.form.value.tempo_preparo,
      tipo_tempo: this.form.value.tipo_tempo,
      porcoes: this.form.value.porcoes,
      tipo_porcao: this.form.value.tipo_porcao,
      ingredientes: this.receita.ingredientes,
      etapas: this.receita.etapas,
      data_criacao: new Date().toISOString(),
    };

    const formData = new FormData();
    formData.append(
      'dados',
      new Blob([JSON.stringify(receitaPronta)], { type: 'application/json' })
    );

    this.imagensSelecionadas.forEach((file, i) => {
      formData.append('imagem' + (i + 1), file);
    });

    /*this.myRecipesService
      .addReceita(receitaPronta, this.imagensSelecionadas)
      .subscribe({
        next: (res) => {
          alert('Receita cadastrada!');
          this.form.reset();
          this.imagensSelecionadas = [];
        },
        error: (err) => {
          alert('Erro ao cadastrar receita.');
          console.error(err);
        },
      });*/

    console.log('🍳 Enviando receita:', receitaPronta);
    this.myRecipesService
      .addReceita(receitaPronta, this.imagensSelecionadas)
      .subscribe({
        next: (res) => {
          console.log('✅ Receita enviada com sucesso!', res);
          alert('Receita cadastrada!');
          this.form.reset();
          this.imagensSelecionadas = [];
        },
        error: (err) => {
          console.error('❌ Erro ao enviar receita:', err);
          alert('Erro ao cadastrar receita.');
        },
      });
  }
}
