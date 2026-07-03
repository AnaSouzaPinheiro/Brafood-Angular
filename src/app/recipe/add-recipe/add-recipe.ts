import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Categoria } from '../../model/categoria';
import { Receita } from '../../model/receita';
import { Dropdown, Option } from '../../profile/dropdown/dropdown';
import { InputImages } from '../../profile/input-images/input-images';
import { InputList } from '../../profile/input-list/input-list';
import { Perfil } from '../../profile/perfil/perfil';
import { AuthService } from '../../services/auth/auth.service';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { ModalService } from '../../services/modal/modal.service';
import { ReceitaService } from '../../services/receita/receita.service';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { BraInput } from '../../shared/input/input';

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
    { label: 'Porções', value: 'Porções' },
    { label: 'Pedaços', value: 'Pedaços' },
    { label: 'Pratos', value: 'Pratos' },
    { label: 'Fatias', value: 'Fatias' },
    { label: 'Unidades', value: 'Unidades' },
  ];

  porcaoSelecionada: Option[] = [];
  tentouEnviar = false;
  erroImagem: string | null = null;

  // Crédito de fonte — true = receita autoral (padrão)
  receitaPropria = true;

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
    imagens: [],
    qtd_fav: 0,
    data_criacao: '',
    autor: '',
    ingredientes: [{ titulo: '', itens: [] }],
    etapas: [{ titulo: '', ordem: 1, descricoes: [] }],
  };

  capaSelecionada: File | null = null;
  galeriaSelecionada: File[] = [];

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private receitaService: ReceitaService,
    private modalService: ModalService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      titulo: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      resumo: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(255),
        ],
      ],
      categoria: [null, Validators.required],
      subcategoria: [null, Validators.required],
      dificuldade: [
        null,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(3),
          Validators.pattern(/^\d+$/),
        ],
      ],
      tempo_hora: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      tempo_min: [
        null,
        [Validators.required, Validators.max(59), Validators.pattern(/^\d+$/)],
      ],
      porcoes: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      tipo_porcao: [null, Validators.required],
      fonte_autor: ['', [Validators.maxLength(150)]],
      fonte_url: ['', [Validators.maxLength(500)]],
      video_url: ['', [Validators.maxLength(500)]],
    });
  }

  onReceitaPropriaChange(propria: boolean) {
    this.receitaPropria = propria;

    const fonteAutorCtrl = this.form.get('fonte_autor');
    if (propria) {
      fonteAutorCtrl?.clearValidators();
      this.form.patchValue({ fonte_autor: '', fonte_url: '', video_url: '' });
    } else {
      fonteAutorCtrl?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(150),
      ]);
    }
    fonteAutorCtrl?.updateValueAndValidity();
  }

  ngOnInit() {
    this.categoriaService.listCats().subscribe({
      next: (res: Categoria[]) => {
        this.categorias = res;
        this.categoriasDropdown = res.map((cat) => ({
          label: cat.nome,
          value: cat.id.toString(),
        }));
        res.forEach((cat) => {
          this.subcategoriasPorCategoria[cat.id] = (cat.subcategorias || [])
            .filter((sub) => sub.nome !== 'Todas')
            .map((sub) => ({ label: sub.nome, value: sub.id.toString() }));
        });

        const aiData = localStorage.getItem('ai_recipe');
        if (aiData) {
          this.preencherFormularioComIA(JSON.parse(aiData));
          localStorage.removeItem('ai_recipe');
        }
      },
      error: (err: any) => console.error(err),
    });
  }
  
  onCategoriaSelecionada(event: Option[]) {
    this.categoriasSelecionadas = event;
    this.subcategoriasSelecionadas = {};
    this.form.patchValue({
      categoria: event[0]?.value ?? null,
      subcategoria: null,
    });
  }

  onSubcategoriaSelecionada(catId: string, selecionadas: Option[]) {
    this.subcategoriasSelecionadas[catId] = selecionadas;
    this.form.patchValue({ subcategoria: selecionadas[0]?.value ?? null });
  }

  onPorcaoSelecionada(event: Option[]) {
    this.form.patchValue({ tipo_porcao: event[0]?.value ?? null });
  }

  onCapaSelecionada(file: File | null) {
    this.capaSelecionada = file;
    if (file) this.erroImagem = null;
  }

  onGaleriaSelecionada(event: { mantidas: string[]; novas: File[] }) {
    this.galeriaSelecionada = event.novas;
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

  atualizarIngredientes(lista: any[]) {
    this.receita.ingredientes = lista.map((ing: any) => ({
      titulo: ing.title,
      itens: ing.subitems,
    }));
  }

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

  preencherFormularioComIA(data: any) {
    this.form.patchValue({
      titulo: data.titulo,
      resumo: data.resumo,
      dificuldade: data.dificuldade,
      tempo_hora: data.tempo_hora,
      tempo_min: data.tempo_min,
      porcoes: data.porcoes,
      tipo_porcao: data.tipo_porcao,
    });

    this.porcaoSelecionada = [
      { label: data.tipo_porcao, value: data.tipo_porcao },
    ];

    const idsCategorias =
      data.idCategoria?.split(',').map((id: string) => id.trim()) || [];
    const idsSubcategorias =
      data.idSubcategoria?.split(',').map((id: string) => id.trim()) || [];

    this.categoriasSelecionadas = this.categorias
      .filter((cat) => idsCategorias.includes(cat.id.toString()))
      .map((cat) => ({ label: cat.nome, value: cat.id.toString() }));

    const novasSubs: { [catId: string]: Option[] } = {};
    this.categorias.forEach((cat) => {
      const subs = this.subcategoriasPorCategoria[cat.id] || [];
      const subsSelecionadas = subs.filter((sub) =>
        idsSubcategorias.includes(sub.value),
      );
      if (subsSelecionadas.length > 0) novasSubs[cat.id] = subsSelecionadas;
    });

    this.subcategoriasSelecionadas = novasSubs;
    this.form.patchValue({
      categoria: idsCategorias,
      subcategoria: idsSubcategorias,
    });
    this.receita.ingredientes = data.ingredientes;
    this.receita.etapas = data.etapas;
  }

  salvar() {
    this.tentouEnviar = true;
    this.form.markAllAsTouched();

    if (!this.capaSelecionada) {
      this.erroImagem = 'Adicione a imagem de capa da receita.';
    } else {
      this.erroImagem = null;
    }

    const temCategoria = !!this.form.value.categoria?.length;
    const temSubcategoria = !!this.form.value.subcategoria?.length;
    const temPorcao = !!this.form.value.tipo_porcao;
    const temIngrediente = this.receita.ingredientes.some((ing) =>
      ing.itens.some((item: string) => item.trim().length > 0),
    );
    const temEtapa = this.receita.etapas.some((et) =>
      (et.descricoes ?? []).some(
        (d: any) =>
          (typeof d === 'string' ? d : (d.descricao ?? '')).trim().length > 0,
      ),
    );

    const listaValida = temIngrediente && temEtapa;
    const dropdownsValidos = temCategoria && temSubcategoria && temPorcao;
    const fonteValida = this.receitaPropria || !!this.form.value.fonte_autor?.trim();

    if (
      this.form.invalid ||
      !this.capaSelecionada ||
      !dropdownsValidos ||
      !listaValida ||
      !fonteValida
    ) {
      const primeiroErro = document.querySelector(
        '.input-error, .imagem-error, .field-error',
      );
      primeiroErro?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.modalService.open({
        type: 'error',
        title: 'Sessão expirada',
        message: 'Faça login novamente para cadastrar uma receita.',
      });
      return;
    }

    const fv = this.form.value;
    const receitaPronta = {
      ...this.receita,
      titulo: fv.titulo,
      resumo: fv.resumo,
      categoria: fv.categoria,
      subcategoria: fv.subcategoria,
      dificuldade: fv.dificuldade,
      tempo_hora: fv.tempo_hora,
      tempo_min: fv.tempo_min,
      porcoes: fv.porcoes,
      tipo_porcao: fv.tipo_porcao,
      ingredientes: this.receita.ingredientes,
      etapas: this.receita.etapas,
      data_criacao: new Date().toISOString(),
      autor: userId,
      eh_propria: this.receitaPropria,
      fonte_autor: this.receitaPropria ? null : fv.fonte_autor?.trim(),
      fonte_url: this.receitaPropria ? null : fv.fonte_url?.trim() || null,
      video_url: this.receitaPropria ? null : fv.video_url?.trim() || null,
    };

    this.receitaService
      .addReceita(receitaPronta, this.capaSelecionada, this.galeriaSelecionada)
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.form.reset();
            this.capaSelecionada = null;
            this.galeriaSelecionada = [];
            this.tentouEnviar = false;
            this.receitaPropria = true;
            this.modalService.open({
              type: 'success',
              title: 'Receita adicionada',
              message: 'Informações da receita foram salvas com sucesso!',
              confirmText: 'OK',
              onConfirm: () =>
                this.router.navigate(['/minhas-receitas', userId]),
            });
          } else {
            this.modalService.open({
              type: 'error',
              title: 'Erro',
              message: res?.mensagem || 'Erro ao cadastrar receita.',
            });
          }
        },
        error: (err) => {
          this.modalService.open({
            type: 'error',
            title: 'Erro',
            message: err?.mensagem || 'Erro ao cadastrar receita.',
          });
        },
      });
  }
}
