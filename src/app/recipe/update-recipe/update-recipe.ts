import { Component, OnInit } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'bra-update-recipe',
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
  templateUrl: './update-recipe.html',
  styleUrl: './update-recipe.scss',
})
export class UpdateRecipe implements OnInit {
  form: FormGroup;

  categorias: Categoria[] = [];
  categoriasDropdown: Option[] = [];
  categoriasSelecionadas: Option[] = [];
  subcategoriasSelecionadas: { [catId: string]: Option[] } = {};
  subcategoriasPorCategoria: { [catId: string]: Option[] } = {};

  imagemPreview1: string | null = null;
  imagemPreview2: string | null = null;
  imagemPreview3: string | null = null;

  ingredientesComoItems: any[] = [];
  etapasComoItems: any[] = [];

  porcoesDropdown: Option[] = [
    { label: 'Porções', value: 'Porções' },
    { label: 'Pedaços', value: 'Pedaços' },
    { label: 'Pratos', value: 'Pratos' },
    { label: 'Fatias', value: 'Fatias' },
    { label: 'Unidades', value: 'Unidades' },
  ];
  porcaoSelecionada: Option[] = [];

  receita: Receita = {
    id: 0,
    titulo: '',
    resumo: '',
    categoria: '',
    subcategoria: '',
    dificuldade: 0,
    tempo_hora: 0,
    tempo_min: 0,
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
    private myRecipesService: MyRecipesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      resumo: ['', Validators.required],
      categoriasSelecionadas: [[], Validators.required],
      subcategoria: [null, Validators.required], // adicionamos o controle de subcategoria
      dificuldade: [
        null,
        [Validators.required, Validators.min(1), Validators.max(3)],
      ],
      tempo_hora: [null, Validators.required],
      tempo_min: ['', Validators.required],
      porcoes: [null, Validators.required],
      tipo_porcao: ['', Validators.required],
    });
  }

  idReceita: number = 0;

  // INIT

  ngOnInit() {
    this.idReceita = Number(this.route.snapshot.paramMap.get('id'));

    this.carregarCategorias().subscribe(() => {
      this.myRecipesService.buscarPorId(this.idReceita).subscribe((receita) => {
        this.receita = {
          ...this.receita,
          ...receita,
          resumo: receita.resumo ?? '',
          categoria: receita.categoria ?? '',
          subcategoria: receita.subcategoria ?? '',
        };

        this.carregarReceita(receita);
        this.form.patchValue({
          titulo: receita.titulo,
          resumo: receita.resumo,
          dificuldade: receita.dificuldade,
          tempo_hora: receita.tempo_hora,
          tempo_min: receita.tempo_min,
          porcoes: receita.porcoes,
          tipo_porcao: receita.tipo_porcao,
        });

        // agora as categorias já existem
        this.prepararCategoriaEsub(receita);
      });
    });
  }

  carregarReceita(receita: Receita) {
    this.ingredientesComoItems = receita.ingredientes.map((i) => ({
      title: i.titulo,
      subitems: i.itens,
    }));

    this.etapasComoItems = receita.etapas.map((e) => ({
      title: e.titulo,
      subitems: e.descricoes.map((d) => d.descricao),
    }));

    this.imagemPreview1 = receita.imagem1;
    this.imagemPreview2 = receita.imagem2 ?? null;
    this.imagemPreview3 = receita.imagem3 ?? null;
  }

  // TRANSFORMA ID -> LABEL PARA UPDATE
  prepararCategoriaEsub(receita: Receita) {
    const categoriaEncontrada = this.categorias.find(
      (c) => c.id === Number(receita.categoria)
    );

    if (!categoriaEncontrada) return;

    // Prepara a opção da categoria
    const optionCat: Option = {
      label: categoriaEncontrada.nome,
      value: categoriaEncontrada.id.toString(),
    };

    this.categoriasSelecionadas = [optionCat];

    // Prepara subcategorias
    const subs = this.subcategoriasPorCategoria[categoriaEncontrada.id] || [];
    const subEncontrada = subs.find(
      (s) => s.value === (receita.subcategoria ?? '').toString()
    );

    if (subEncontrada) {
      this.subcategoriasSelecionadas[categoriaEncontrada.id] = [subEncontrada];
    }

    // Atualiza o formulário
    this.form.patchValue({
      categoriasSelecionadas: [optionCat],
      subcategoria: subEncontrada?.value ?? null,
    });
  }

  // CARREGAR CATEGORIAS/SUBS

  carregarCategorias() {
    return this.categoriaService.listCats().pipe(
      tap((res: Categoria[]) => {
        this.categorias = res;

        this.categoriasDropdown = res.map((cat) => ({
          label: cat.nome,
          value: cat.id.toString(),
        }));

        res.forEach((cat) => {
          this.subcategoriasPorCategoria[cat.id] = (cat.subcategorias || [])
            .filter((s) => s.nome !== 'Todas')
            .map((s) => ({
              label: s.nome,
              value: s.id.toString(),
            }));
        });
      })
    );
  }

  // SELETORES

  onCategoriaSelecionada(event: Option[]) {
    this.categoriasSelecionadas = [...event];
    this.form.patchValue({
      categoriasSelecionadas: this.categoriasSelecionadas,
      subcategoria: null, // reseta a subcategoria ao mudar a categoria
    });

    const catValue = event[0]?.value;
    if (catValue) {
      this.subcategoriasSelecionadas = {};
      this.receita.categoria = catValue;
    }
  }

  onSubcategoriaSelecionada(catId: string, selecionadas: Option[]) {
    this.subcategoriasSelecionadas[catId] = [...selecionadas];
    this.receita.subcategoria = selecionadas[0]?.value ?? '';

    // Atualiza o form control
    this.form.patchValue({ subcategoria: selecionadas[0]?.value ?? null });
  }

  onPorcaoSelecionada(event: Option[]) {
    if (event.length) {
      this.receita.tipo_porcao = event[0].value;
      this.form.patchValue({ tipo_porcao: event[0].value });
    }
  }

  // IMAGENS / PREVIEW

  onImagensSelecionadas(files: File[]) {
    this.imagensSelecionadas = files;

    if (files[0]) {
      const r = new FileReader();
      r.onload = () => (this.imagemPreview1 = r.result as string);
      r.readAsDataURL(files[0]);
    }

    if (files[1]) {
      const r = new FileReader();
      r.onload = () => (this.imagemPreview2 = r.result as string);
      r.readAsDataURL(files[1]);
    }

    if (files[2]) {
      const r = new FileReader();
      r.onload = () => (this.imagemPreview3 = r.result as string);
      r.readAsDataURL(files[2]);
    }
  }

  // INGREDIENTES E ETAPAS

  atualizarIngredientes(lista: any[]) {
    this.receita.ingredientes = lista.map((i) => ({
      titulo: i.title,
      itens: i.subitems,
    }));
  }

  atualizarEtapas(lista: any[]) {
    this.receita.etapas = lista.map((et, i) => ({
      titulo: et.title,
      ordem: i + 1,
      descricoes: et.subitems.map((d: string, j: number) => ({
        descricao: d,
        ordem: j + 1,
      })),
    }));
  }

  // SALVAR

  salvar() {
    const categoriaSelecionada = this.categoriasSelecionadas[0];
    const subSelecionada =
      this.subcategoriasSelecionadas[categoriaSelecionada?.value]?.[0];

    const receitaPronta = {
      ...this.receita,
      titulo: this.form.value.titulo,
      resumo: this.form.value.resumo,
      categoria: this.form.value.categoriasSelecionadas[0]?.value ?? '',
      subcategoria: this.form.value.subcategoria ?? '',
      dificuldade: this.form.value.dificuldade,
      tempo_hora: this.form.value.tempo_hora,
      tempo_min: this.form.value.tempo_min,
      porcoes: this.form.value.porcoes,
      tipo_porcao: this.form.value.tipo_porcao,
      ingredientes: this.receita.ingredientes,
      etapas: this.receita.etapas,
    };

    console.log(receitaPronta);

    this.myRecipesService
      .updateReceita(this.idReceita, receitaPronta, this.imagensSelecionadas)
      .subscribe({
        next: () => {
          alert('Receita atualizada!');
        },
        error: () => alert('Erro ao atualizar receita.'),
      });
  }
}
