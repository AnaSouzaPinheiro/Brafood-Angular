import { Component, DestroyRef, QueryList, ViewChildren, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import {
  APELIDO_ERROS,
  APELIDO_REGEX,
  ApelidoService,
} from '../../services/apelido/apelido.service';
import { InputAcesso } from '../input-acesso/input-acesso';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'bra-cadastro',
  imports: [FormsModule, InputAcesso, CustomButton, RouterModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export class Cadastro {
  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  erros: string[] = [];

  // Apelido: sugerido a partir do nome até a pessoa editar manualmente
  apelido = '';
  apelidoEditado = false;
  apelidoErro: string | null = null;
  apelidoStatus: 'idle' | 'verificando' | 'ok' = 'idle';

  private apelidoService = inject(ApelidoService);
  private destroyRef = inject(DestroyRef);
  private nome$ = new Subject<string>();
  private apelido$ = new Subject<string>();

  @ViewChildren(InputAcesso) inputsAcesso!: QueryList<InputAcesso>;

  constructor(
    private router: Router,
    private auth: AuthService,
    private location: Location,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    // Nome digitado → sugestão de apelido livre (vinda do servidor)
    this.nome$
      .pipe(
        debounceTime(500),
        filter((nome) => !this.apelidoEditado && nome.trim().length >= 2),
        distinctUntilChanged(),
        switchMap((nome) => this.apelidoService.sugerir(nome)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (sugestao) => {
          if (this.apelidoEditado) return;
          this.apelido = sugestao;
          this.apelidoErro = null;
          this.apelidoStatus = 'ok';
        },
        error: () => {},
      });

    // Apelido editado → confere formato e disponibilidade
    this.apelido$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((v) => this.formatoApelido(v)),
        switchMap((v) => this.apelidoService.verificar(v)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (r) => {
          this.apelidoErro = r.valido && r.disponivel ? null : r.mensagem;
          this.apelidoStatus = this.apelidoErro ? 'idle' : 'ok';
        },
        error: () => (this.apelidoStatus = 'idle'),
      });
  }

  onNomeChange(nome: string) {
    this.nome$.next(nome);
  }

  onApelidoChange(valor: string) {
    this.apelidoEditado = true;
    this.apelido = (valor ?? '').toLowerCase().trim();
    this.apelidoErro = null;
    this.apelidoStatus = 'verificando';
    this.apelido$.next(this.apelido);
  }

  /** Valida o formato localmente; devolve true se puder consultar o servidor */
  private formatoApelido(v: string): boolean {
    if (!v) {
      this.apelidoErro = APELIDO_ERROS['required'];
    } else if (v.length < 3) {
      this.apelidoErro = APELIDO_ERROS['minlength'];
    } else if (v.length > 30) {
      this.apelidoErro = APELIDO_ERROS['maxlength'];
    } else if (!APELIDO_REGEX.test(v)) {
      this.apelidoErro = APELIDO_ERROS['apelidoFormato'];
    } else {
      return true;
    }
    this.apelidoStatus = 'idle';
    return false;
  }

  cadastrar() {
    this.erros = [];

    this.inputsAcesso.forEach((input) => input.markAsTouched());

    const senhaOk = this.validarSenhaFront();

    if (!senhaOk) return;

    if (!this.nome.trim() || !this.email.trim() || !this.senha) return;

    // Apelido vazio é aceito: o servidor gera um a partir do nome
    if (this.apelido && (this.apelidoErro || this.apelidoStatus === 'verificando')) return;

    const returnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl') || '/home';

    this.authService
      .cadastro(this.nome, this.email, this.senha, this.confirmarSenha, this.apelido)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl },
            });
          } else if (res.errors?.apelido) {
            this.apelidoErro = res.errors.apelido;
            this.apelidoStatus = 'idle';
          } else {
            Object.values(res.errors ?? {}).forEach((erro: any, indice: number) => {
              const cor = erro ? 'red' : 'green';
              this.mudarCorErro(indice, cor);
            });
          }
        },
        () => {
          this.erros = ['Erro ao conectar com o servidor.'];
        },
      );
  }

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }

  mudarCorErro(indice: number, cor: string) {
    const li = document.getElementById('r' + indice);
    if (li) {
      li.style.color = cor;
    }
  }

  validarSenhaFront() {
    const regras = [
      this.senha.length >= 8,
      /[0-9]/.test(this.senha),
      /[a-z]/.test(this.senha),
      /[A-Z]/.test(this.senha),
      /[!@#$.?&()+-]/.test(this.senha),
    ];

    regras.forEach((valido, i) => {
      this.mudarCorErro(i, valido ? 'green' : 'red');
    });

    return regras.every((r) => r);
  }
}
