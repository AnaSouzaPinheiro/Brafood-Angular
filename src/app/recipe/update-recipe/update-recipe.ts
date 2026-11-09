import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Categoria } from '../../model/categoria';
import { Receita } from '../../model/receita';
import { Dropdown, Option } from '../../profile/dropdown/dropdown';
import { RecipeMetaFields } from '../../shared/recipe-meta-fields/recipe-meta-fields';
import { InputImages } from '../../profile/input-images/input-images';
import { InputList } from '../../profile/input-list/input-list';
import { AuthService } from '../../services/auth/auth.service';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ModalService } from '../../services/modal/modal.service';
import { ReceitaService } from '../../services/receita/receita.service';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { BraInput } from '../../shared/input/input';

@Component({
  selector: 'bra-update-recipe',
  imports: [
    RecipeMetaFields,
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
  // ---- Alterações não salvas ----
  private alterou = false;
  private salvou = false;

  temAlteracoes(): boolean {
    return !this.salvou && (this.alterou || this.form.dirty);
  }

  @HostListener('window:beforeunload', ['$event'])
  avisarAoFecharAba(e: BeforeUnloadEvent) {
    if (this.temAlteracoes()) e.preventDefault();
  }

  /** Só conta alterações depois que a receita terminou de carregar. */
  private carregado = false;

  private marcarAlteracao() {
    if (this.carregado) this.alterou = true;
  }

  form: FormGroup;

  categorias: Categoria[] = [];
  categoriasDropdown: Option[] = [];
  categoriasSelecionadas: Option[] = [];
  subcategoriasSelecionadas: { [catId: string]: Option[] } = {};
  subcategoriasPorCategoria: { [catId: string]: Option[] } = {};

  porcaoSelecionada: Option[] = [];
  tentouEnviar = false;

  // Crédito de fonte — true = receita autoral (padrão)
  receitaPropria = true;

  imagemPreviewCapa: string | null = null;
  galeriaAtual: string[] = [];

  ingredientesComoItems: any[] = [];
  etapasComoItems: any[] = [];

  porcoesDropdown: Option[] = [
    { label: 'Porções', value: 'Porções' },
    { label: 'Pedaços', value: 'Pedaços' },
    { label: 'Pratos', value: 'Pratos' },
    { label: 'Fatias', value: 'Fatias' },
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
    imagens: [],
    qtd_fav: 0,
    data_criacao: '',
    autor: '',
    ingredientes: [{ titulo: '', itens: [] }],
    etapas: [{ titulo: '', ordem: 1, descricoes: [] }],
  };

  capaSelecionada: File | null = null;
  galeriaNova: File[] = [];
  idReceita: number = 0;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private receitaService: ReceitaService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private authService: AuthService,
    private logger: LoggerService,
  ) {
    this.form = this.fb.group({
      titulo: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      resumo: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
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
      porcoes: [
        null,
        [Validators.required, Validators.min(1), Validators.max(50), Validators.pattern(/^\d+$/)],
      ],
      tipo_porcao: [null, Validators.required],
      fonte_autor: ['', [Validators.maxLength(150)]],
      fonte_url: ['', [Validators.maxLength(500)]],
      video_url: ['', [Validators.maxLength(500)]],
    });
  }

  onReceitaPropriaChange(propria: boolean) {
    this.marcarAlteracao();
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

  // INIT
  ngOnInit() {
    this.idReceita = Number(this.route.snapshot.paramMap.get('id'));

    this.carregarCategorias().subscribe(() => {
      this.receitaService.buscarPorId(this.idReceita).subscribe((receita) => {
        this.receita = {
          ...this.receita,
          ...receita,
          resumo: receita.resumo ?? '',
          categoria: receita.categoria ?? '',
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

        this.receitaPropria =
          receita.eh_propria === undefined ||
          receita.eh_propria === null ||
          Number(receita.eh_propria) === 1;

        if (!this.receitaPropria) {
          this.onReceitaPropriaChange(false);
          this.form.patchValue({
            fonte_autor: receita.fonte_autor ?? '',
            fonte_url: receita.fonte_url ?? '',
            video_url: receita.video_url ?? '',
          });
        }

        if (receita.tipo_porcao) {
          this.porcaoSelecionada = [
            { label: receita.tipo_porcao, value: receita.tipo_porcao },
          ];
        }

        this.prepararCategoriaESub(receita);
        setTimeout(() => {
          this.form.markAsPristine();
          this.alterou = false;
          this.carregado = true;
        });
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

    this.imagemPreviewCapa = receita.imagem1;
    this.galeriaAtual = [...(receita.imagens ?? [])];
  }

  prepararCategoriaESub(receita: Receita) {
    const idsCategorias = receita.idCategoria
      ? receita.idCategoria.split(',').map((id) => id.trim())
      : [];

    const idsSubcategorias = receita.idSubcategoria
      ? receita.idSubcategoria.split(',').map((id) => id.trim())
      : [];

    this.categoriasSelecionadas = this.categorias
      .filter((c) => idsCategorias.includes(c.id.toString()))
      .map((c) => ({
        label: c.nome,
        value: c.id.toString(),
      }));

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

    this.form.patchValue({
      categoria: idsCategorias,
      subcategoria: idsSubcategorias,
    });
  }

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
      }),
    );
  }

  onCategoriaSelecionada(event: Option[]) {
    this.marcarAlteracao();
    this.categoriasSelecionadas = [...event];

    const categoriasIds = event.map((e) => e.value);

    Object.keys(this.subcategoriasSelecionadas).forEach((catId) => {
      if (!categoriasIds.includes(catId)) {
        delete this.subcategoriasSelecionadas[catId];
      }
    });

    const todasSubcategorias = Object.values(this.subcategoriasSelecionadas)
      .flat()
      .map((s) => s.value);

    this.form.patchValue({
      categoria: categoriasIds,
      subcategoria: todasSubcategorias,
    });
  }

  onSubcategoriaSelecionada(catId: string, selecionadas: Option[]) {
    this.marcarAlteracao();
    this.subcategoriasSelecionadas = {
      ...this.subcategoriasSelecionadas,
      [catId]: [...selecionadas],
    };

    const todasSubcategorias = Object.values(this.subcategoriasSelecionadas)
      .flat()
      .map((s) => s.value);

    this.form.patchValue({
      subcategoria: todasSubcategorias,
    });
  }

  onPorcaoSelecionada(event: Option[]) {
    this.marcarAlteracao();
    this.porcaoSelecionada = event;
    this.form.patchValue({ tipo_porcao: event[0]?.value ?? null });
  }

  onCapaSelecionada(file: File | null) {
    this.marcarAlteracao();
    this.capaSelecionada = file;

    if (file) {
      const r = new FileReader();
      r.onload = () => (this.imagemPreviewCapa = r.result as string);
      r.readAsDataURL(file);
    }
  }

  onGaleriaSelecionada(event: { mantidas: string[]; novas: File[] }) {
    this.marcarAlteracao();
    this.galeriaAtual = event.mantidas;
    this.galeriaNova = event.novas;
  }

  atualizarIngredientes(lista: any[]) {
    this.marcarAlteracao();
    this.receita.ingredientes = lista.map((i) => ({
      titulo: i.title,
      itens: i.subitems,
    }));
  }

  atualizarEtapas(lista: any[]) {
    this.marcarAlteracao();
    this.receita.etapas = lista.map((et, i) => ({
      titulo: et.title,
      ordem: i + 1,
      descricoes: et.subitems.map((d: string, j: number) => ({
        descricao: d,
        ordem: j + 1,
      })),
    }));
  }

  cancelar() {
    const idUsuario =
      this.authService.getUserId() ??
      Number(this.route.snapshot.queryParamMap.get('user'));
    this.router.navigate(['/perfil/receitas']);
  }

  salvar() {
    this.tentouEnviar = true;
    this.form.markAllAsTouched();

    const temCategoria = !!this.form.value.categoria?.length;
    const temSubcategoria = !!this.form.value.subcategoria?.length;
    const temPorcao = !!this.form.value.tipo_porcao;
    const temIngrediente = this.receita.ingredientes.some((ing: any) =>
      ing.itens.some((item: string) => item.trim().length > 0),
    );
    const temEtapa = this.receita.etapas.some((et: any) =>
      (et.descricoes ?? []).some(
        (d: any) =>
          (typeof d === 'string' ? d : (d.descricao ?? '')).trim().length > 0,
      ),
    );
    const fonteValida = this.receitaPropria || !!this.form.value.fonte_autor?.trim();

    if (
      this.form.invalid ||
      !temCategoria ||
      !temSubcategoria ||
      !temPorcao ||
      !temIngrediente ||
      !temEtapa ||
      !fonteValida
    ) {
      const primeiroErro = document.querySelector('.input-error, .field-error');
      primeiroErro?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const fv = this.form.value;

    const receitaPronta = {
      ...this.receita,
      titulo: fv.titulo,
      resumo: fv.resumo,
      idCategoria: fv.categoria,
      idSubcategoria: fv.subcategoria,
      dificuldade: fv.dificuldade,
      tempo_hora: fv.tempo_hora,
      tempo_min: fv.tempo_min,
      porcoes: fv.porcoes,
      tipo_porcao: fv.tipo_porcao,
      ingredientes: this.receita.ingredientes,
      etapas: this.receita.etapas,
      eh_propria: this.receitaPropria,
      fonte_autor: this.receitaPropria ? null : fv.fonte_autor?.trim(),
      fonte_url: this.receitaPropria ? null : fv.fonte_url?.trim() || null,
      video_url: this.receitaPropria ? null : fv.video_url?.trim() || null,
    };

    this.receitaService
      .updateReceita(
        this.idReceita,
        receitaPronta,
        this.capaSelecionada,
        this.galeriaAtual,
        this.galeriaNova,
      )
      .subscribe({
        next: (res) => {
          if (res?.success) {
            this.salvou = true;
            const idUsuario =
              this.authService.getUserId() ??
              Number(this.route.snapshot.queryParamMap.get('user'));
            this.modalService.open({
              type: 'success',
              title: 'Receita atualizada!',
              message: 'Informações da receita salvas com sucesso.',
              confirmText: 'OK',
              onConfirm: () => {
                this.router.navigate(['/perfil/receitas']);
              },
            });
          } else {
            this.modalService.open({
              type: 'error',
              title: 'Erro',
              message: res?.mensagem || 'Erro ao atualizar receita.',
            });
          }
        },
        error: (err) => {
          this.logger.error('Erro ao atualizar receita:', err);
          this.modalService.open({
            type: 'error',
            title: 'Erro de comunicação',
            message: 'Não foi possível conectar ao servidor.',
          });
        },
      });
  }
}
