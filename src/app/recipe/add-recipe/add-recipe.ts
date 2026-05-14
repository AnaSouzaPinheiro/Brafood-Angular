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
import { CategoriaService } from '../../services/categoria/categoria.service';
import { Option } from '../../profile/dropdown/dropdown';
import { ReceitaService } from '../../services/receita/receita.service';
import { ModalService } from '../../services/modal/modal.service';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    private receitaService: ReceitaService,
    private modalService: ModalService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      resumo: ['', Validators.required],
      // Categoria e subcategoria ficam no form como fonte única de verdade
      categoria: [null, Validators.required],
      subcategoria: [null, Validators.required],
      dificuldade: [
        null,
        [Validators.required, Validators.min(1), Validators.max(3)],
      ],
      tempo_hora: [null, Validators.required],
      tempo_min: [null, Validators.required],
      porcoes: [null, Validators.required],
      // tipo_porcao vive só aqui — o dropdown atualiza via patchValue
      tipo_porcao: [null, Validators.required],
    });
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
            .map((sub) => ({
              label: sub.nome,
              value: sub.id.toString(),
            }));
        });

        // preenche IA
        const aiData = localStorage.getItem('ai_recipe');

        if (aiData) {
          const receita = JSON.parse(aiData);

          this.preencherFormularioComIA(receita);

          localStorage.removeItem('ai_recipe');
        }
      },

      error: (err: any) => console.error(err),
    });
  }

  carregarCategorias() {
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
            .map((sub) => ({
              label: sub.nome,
              value: sub.id.toString(), // ID, não nome
            }));
        });
      },
      error: (err: any) => console.error(err),
    });
  }

  // ========== Categorias ==========
  onCategoriaSelecionada(event: Option[]) {
    this.categoriasSelecionadas = event;
    // Reseta subcategoria ao trocar categoria
    this.subcategoriasSelecionadas = {};
    this.form.patchValue({
      categoria: event[0]?.value ?? null,
      subcategoria: null,
    });
  }

  onSubcategoriaSelecionada(catId: string, selecionadas: Option[]) {
    this.subcategoriasSelecionadas[catId] = selecionadas;
    // Atualiza o form control com o ID da subcategoria
    this.form.patchValue({ subcategoria: selecionadas[0]?.value ?? null });
  }

  // ========== Porções ==========
  onPorcaoSelecionada(event: Option[]) {
    // Fonte única de verdade: só o form control
    this.form.patchValue({ tipo_porcao: event[0]?.value ?? null });
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

    // PORÇÃO
    this.porcaoSelecionada = [
      {
        label: data.tipo_porcao,
        value: data.tipo_porcao,
      },
    ];

    // CATEGORIAS
    const idsCategorias =
      data.idCategoria?.split(',').map((id: string) => id.trim()) || [];

    const idsSubcategorias =
      data.idSubcategoria?.split(',').map((id: string) => id.trim()) || [];

    this.categoriasSelecionadas = this.categorias
      .filter((cat) => idsCategorias.includes(cat.id.toString()))
      .map((cat) => ({
        label: cat.nome,
        value: cat.id.toString(),
      }));

    // SUBCATEGORIAS
    const novasSubs: { [catId: string]: Option[] } = {};

    this.categorias.forEach((cat) => {
      const subs = this.subcategoriasPorCategoria[cat.id] || [];

      const subsSelecionadas = subs.filter((sub) =>
        idsSubcategorias.includes(sub.value),
      );

      if (subsSelecionadas.length > 0) {
        novasSubs[cat.id] = subsSelecionadas;
      }
    });

    this.subcategoriasSelecionadas = novasSubs;

    // PATCH IDS NO FORM
    this.form.patchValue({
      categoria: idsCategorias,
      subcategoria: idsSubcategorias,
    });

    // INGREDIENTES / ETAPAS
    this.receita.ingredientes = data.ingredientes;
    this.receita.etapas = data.etapas;
  }

  // ========== Salvar ==========
  salvar() {
    // Bloqueia envio se o formulário estiver inválido
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modalService.open({
        type: 'error',
        title: 'Campos obrigatórios',
        message: 'Preencha todos os campos antes de enviar a receita.',
      });
      return;
    }

    if (this.imagensSelecionadas.length === 0) {
      this.modalService.open({
        type: 'error',
        title: 'Imagem obrigatória',
        message: 'Adicione pelo menos uma imagem da receita.',
      });

      return;
    }
    // Obtém o usuário pelo serviço — sem tocar em localStorage aqui
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
      // Envia o ID da categoria e o ID da subcategoria (não os nomes)
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
    };

    this.receitaService
      .addReceita(receitaPronta, this.imagensSelecionadas)
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.form.reset();
            this.imagensSelecionadas = [];
            this.modalService.open({
              type: 'success',
              title: 'Receita adicionada',
              message: 'Informações da receita foram salvas com sucesso!',
              confirmText: 'OK',
              onConfirm: () => {
                this.router.navigate(['/minhas-receitas', userId]);
              },
            });
          } else {
            this.modalService.open({
              type: 'error',
              title: 'Erro',
              message: res?.message || 'Erro ao cadastrar receita.',
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
