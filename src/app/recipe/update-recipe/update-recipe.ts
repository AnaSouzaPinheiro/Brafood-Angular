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
import { CategoriaService } from '../../services/categoria/categoria.service';
import { Option } from '../../profile/dropdown/dropdown';
import { ReceitaService } from '../../services/receita/receita.service';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ModalService } from '../../services/modal/modal.service';
import { AuthService } from '../../services/auth/auth.service';

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

  // Estes dois são passados diretamente como [selected] para os dropdowns.
  // Só são populados DEPOIS que categorias e receita chegam — sem valor inicial
  // vazio que confunda o ngOnChanges do Dropdown.
  categoriasSelecionadas: Option[] = [];
  subcategoriasSelecionadas: { [catId: string]: Option[] } = {};
  subcategoriasPorCategoria: { [catId: string]: Option[] } = {};

  // Pré-seleção do dropdown de porções: também só populado após carregar a receita
  porcaoSelecionada: Option[] = [];

  imagemPreview1: string | null = null;
  imagemPreview2: string | null = null;
  imagemPreview3: string | null = null;

  ingredientesComoItems: any[] = [];
  etapasComoItems: any[] = [];

  porcoesDropdown: Option[] = [
    { label: 'Porções',  value: 'Porções'  },
    { label: 'Pedaços',  value: 'Pedaços'  },
    { label: 'Pratos',   value: 'Pratos'   },
    { label: 'Fatias',   value: 'Fatias'   },
    { label: 'Unidades', value: 'Unidades' },
  ];

  receita: Receita = {
    id: 0,
    titulo: '',
    resumo: '',
    categoria: '',
    idCategoria: undefined,
    idSubcategoria: undefined,
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
  idReceita: number = 0;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private receitaService: ReceitaService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      titulo:       ['', Validators.required],
      resumo:       ['', Validators.required],
      categoria:    [null, Validators.required],
      subcategoria: [null, Validators.required],
      dificuldade: [
        null,
        [Validators.required, Validators.min(1), Validators.max(3)],
      ],
      tempo_hora:  [null, Validators.required],
      tempo_min:   [null, Validators.required],
      porcoes:     [null, Validators.required],
      tipo_porcao: [null, Validators.required],
    });
  }

  // INIT

  ngOnInit() {
    this.idReceita = Number(this.route.snapshot.paramMap.get('id'));

    // Carrega categorias primeiro; só então carrega a receita.
    // Assim quando prepararCategoriaESub() rodar, subcategoriasPorCategoria já está pronto.
    this.carregarCategorias().subscribe(() => {
      this.receitaService.buscarPorId(this.idReceita).subscribe((receita) => {
        this.receita = {
          ...this.receita,
          ...receita,
          resumo:    receita.resumo    ?? '',
          categoria: receita.categoria ?? '',
        };

        this.carregarReceita(receita);

        // Preenche os campos de texto via form
        this.form.patchValue({
          titulo:      receita.titulo,
          resumo:      receita.resumo,
          dificuldade: receita.dificuldade,
          tempo_hora:  receita.tempo_hora,
          tempo_min:   receita.tempo_min,
          porcoes:     receita.porcoes,
          tipo_porcao: receita.tipo_porcao,
        });

        // Pré-seleciona porções — monta o Option a partir do valor salvo
        if (receita.tipo_porcao) {
          this.porcaoSelecionada = [{ label: receita.tipo_porcao, value: receita.tipo_porcao }];
        }

        // Pré-seleciona categoria e subcategoria pelos IDs
        this.prepararCategoriaESub(receita);
      });
    });
  }

  carregarReceita(receita: Receita) {
    this.ingredientesComoItems = receita.ingredientes.map((i) => ({
      title:    i.titulo,
      subitems: i.itens,
    }));

    this.etapasComoItems = receita.etapas.map((e) => ({
      title:    e.titulo,
      subitems: e.descricoes.map((d) => d.descricao),
    }));

    this.imagemPreview1 = receita.imagem1;
    this.imagemPreview2 = receita.imagem2 ?? null;
    this.imagemPreview3 = receita.imagem3 ?? null;
  }

  // Pré-seleciona categoria e subcategoria a partir dos IDs retornados pela API.
  // Só roda depois que carregarCategorias() completou, então os mapas já existem.
  prepararCategoriaESub(receita: Receita) {
    const categoriaEncontrada = this.categorias.find(
      (c) => c.id === receita.idCategoria,
    );

    if (!categoriaEncontrada) return;

    const optionCat: Option = {
      label: categoriaEncontrada.nome,
      value: categoriaEncontrada.id.toString(),
    };

    // Atribui uma nova referência de array — dispara ngOnChanges no Dropdown
    this.categoriasSelecionadas = [optionCat];

    // Busca subcategoria pelo idSubcategoria retornado pela API
    const subs = this.subcategoriasPorCategoria[categoriaEncontrada.id] || [];
    const subEncontrada = subs.find(
      (s) => s.value === (receita.idSubcategoria ?? '').toString(),
    );

    if (subEncontrada) {
      // Nova referência de objeto — garante que ngOnChanges detecta a mudança
      this.subcategoriasSelecionadas = {
        [categoriaEncontrada.id]: [subEncontrada],
      };
    }

    this.form.patchValue({
      categoria:    optionCat.value,
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
              value: s.id.toString(), // ID, não nome
            }));
        });
      }),
    );
  }

  // SELETORES

  onCategoriaSelecionada(event: Option[]) {
    this.categoriasSelecionadas = [...event];
    // Nova referência para subcategoriasSelecionadas — reseta subcategoria
    this.subcategoriasSelecionadas = {};
    this.form.patchValue({
      categoria:    event[0]?.value ?? null,
      subcategoria: null,
    });
  }

  onSubcategoriaSelecionada(catId: string, selecionadas: Option[]) {
    // Nova referência de objeto para disparar ngOnChanges se necessário
    this.subcategoriasSelecionadas = {
      ...this.subcategoriasSelecionadas,
      [catId]: [...selecionadas],
    };
    this.form.patchValue({ subcategoria: selecionadas[0]?.value ?? null });
  }

  onPorcaoSelecionada(event: Option[]) {
    this.porcaoSelecionada = event;
    this.form.patchValue({ tipo_porcao: event[0]?.value ?? null });
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
      itens:  i.subitems,
    }));
  }

  atualizarEtapas(lista: any[]) {
    this.receita.etapas = lista.map((et, i) => ({
      titulo:    et.title,
      ordem:     i + 1,
      descricoes: et.subitems.map((d: string, j: number) => ({
        descricao: d,
        ordem:     j + 1,
      })),
    }));
  }

  cancelar() {
    const idUsuario = this.authService.getUserId()
      ?? Number(this.route.snapshot.queryParamMap.get('user'));
    this.router.navigate(['/minhas-receitas', idUsuario]);
  }

  // SALVAR

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modalService.open({
        type:    'error',
        title:   'Campos obrigatórios',
        message: 'Preencha todos os campos antes de salvar a receita.',
      });
      return;
    }

    const fv = this.form.value;

    const receitaPronta = {
      ...this.receita,
      titulo:         fv.titulo,
      resumo:         fv.resumo,
      idCategoria:    Number(fv.categoria),
      idSubcategoria: Number(fv.subcategoria),
      dificuldade:    fv.dificuldade,
      tempo_hora:     fv.tempo_hora,
      tempo_min:      fv.tempo_min,
      porcoes:        fv.porcoes,
      tipo_porcao:    fv.tipo_porcao,
      ingredientes:   this.receita.ingredientes,
      etapas:         this.receita.etapas,
    };

    this.receitaService
      .updateReceita(this.idReceita, receitaPronta, this.imagensSelecionadas)
      .subscribe({
        next: (res) => {
          if (res?.success) {
            const idUsuario = this.authService.getUserId()
              ?? Number(this.route.snapshot.queryParamMap.get('user'));
            this.modalService.open({
              type:        'success',
              title:       'Receita atualizada!',
              message:     'Informações da receita salvas com sucesso.',
              confirmText: 'OK',
              onConfirm: () => {
                this.router.navigate(['/minhas-receitas', idUsuario]);
              },
            });
          } else {
            this.modalService.open({
              type:    'error',
              title:   'Erro',
              message: res?.message || 'Erro ao atualizar receita.',
            });
          }
        },
        error: (err) => {
          console.error(err);
          this.modalService.open({
            type:    'error',
            title:   'Erro de comunicação',
            message: 'Não foi possível conectar ao servidor.',
          });
        },
      });
  }
}
