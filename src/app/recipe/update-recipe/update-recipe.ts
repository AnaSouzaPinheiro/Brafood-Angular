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
  categoriasSelecionadas: Option[] = [];
  subcategoriasSelecionadas: { [catId: string]: Option[] } = {};
  subcategoriasPorCategoria: { [catId: string]: Option[] } = {};

  porcaoSelecionada: Option[] = [];
  tentouEnviar = false;

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
          Validators.maxLength(500),
        ],
      ],
      categoria: [null, Validators.required],
      subcategoria: [null, Validators.required],
      dificuldade: [
        null,
        [Validators.required, Validators.min(1), Validators.max(3)],
      ],
      tempo_hora: [null, Validators.required],
      tempo_min: [null, Validators.required],
      porcoes: [null, Validators.required],
      tipo_porcao: [null, Validators.required],
    });
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

        if (receita.tipo_porcao) {
          this.porcaoSelecionada = [
            { label: receita.tipo_porcao, value: receita.tipo_porcao },
          ];
        }

        this.prepararCategoriaESub(receita);
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
    this.porcaoSelecionada = event;
    this.form.patchValue({ tipo_porcao: event[0]?.value ?? null });
  }

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

  cancelar() {
    const idUsuario =
      this.authService.getUserId() ??
      Number(this.route.snapshot.queryParamMap.get('user'));
    this.router.navigate(['/minhas-receitas', idUsuario]);
  }

  salvar() {
    this.tentouEnviar = true;
    this.form.markAllAsTouched();

    const temCategoria = this.categoriasSelecionadas.some((c) => !!c.value);
    const temSubcategoria = this.categoriasSelecionadas.every((cat) =>
      (this.subcategoriasSelecionadas[cat.value] ?? []).some((s) => !!s.value),
    );
    const temPorcao = this.porcaoSelecionada.some((p) => !!p.value);
    const temIngrediente = this.receita.ingredientes.some((ing: any) =>
      ing.itens.some((item: string) => item.trim().length > 0),
    );
    const temEtapa = this.receita.etapas.some((et: any) =>
      (et.descricoes ?? []).some(
        (d: any) =>
          (typeof d === 'string' ? d : (d.descricao ?? '')).trim().length > 0,
      ),
    );

    if (
      this.form.invalid ||
      !temCategoria ||
      !temSubcategoria ||
      !temPorcao ||
      !temIngrediente ||
      !temEtapa
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
    };

    this.receitaService
      .updateReceita(this.idReceita, receitaPronta, this.imagensSelecionadas)
      .subscribe({
        next: (res) => {
          if (res?.success) {
            const idUsuario =
              this.authService.getUserId() ??
              Number(this.route.snapshot.queryParamMap.get('user'));
            this.modalService.open({
              type: 'success',
              title: 'Receita atualizada!',
              message: 'Informações da receita salvas com sucesso.',
              confirmText: 'OK',
              onConfirm: () => {
                this.router.navigate(['/minhas-receitas', idUsuario]);
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
          console.error(err);
          this.modalService.open({
            type: 'error',
            title: 'Erro de comunicação',
            message: 'Não foi possível conectar ao servidor.',
          });
        },
      });
  }
}
