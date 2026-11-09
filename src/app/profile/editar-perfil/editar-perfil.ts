import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../model/user';
import {
    APELIDO_ERROS,
    ApelidoService,
    apelidoFormatoValidator,
} from '../../services/apelido/apelido.service';
import { AuthService } from '../../services/auth/auth.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ModalService } from '../../services/modal/modal.service';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { BraInput } from '../../shared/input/input';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { Perfil } from '../perfil/perfil';

function senhasIguais(group: AbstractControl): ValidationErrors | null {
  const nova = group.get('novaSenha')?.value;
  const confirmar = group.get('confirmarNovaSenha')?.value;

  if (nova && confirmar && nova !== confirmar) {
    group.get('confirmarNovaSenha')?.setErrors({ mismatch: true });
    return { mismatch: true };
  }

  const confirmarCtrl = group.get('confirmarNovaSenha');
  if (confirmarCtrl?.hasError('mismatch')) {
    confirmarCtrl.setErrors(null);
  }

  return null;
}

/** Nome completo num campo só (o sobrenome entra aqui, se a pessoa quiser). */
const LIMITE_NOME_USUARIO = 80;

type EstadoRegra = 'neutro' | 'ok' | 'erro' | 'aviso';

@Component({
  selector: 'bra-editar-perfil',
  imports: [
    BraInput,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    CustomButton,
    Perfil,
    MediaUrlPipe,
  ],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.scss',
})
export class EditarPerfil implements OnInit {
  form!: FormGroup;

  user: User = {
    id: 0,
    email: '',
    nome: '',
    apelido: '',
    genero: '',
    bio: '',
    foto_perfil: '',
  };

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private auth: AuthService,
    private apelidoService: ApelidoService,
    private router: Router,
    private modalService: ModalService,
    private logger: LoggerService,
  ) {
    this.form = this.fb.group(
      {
        apelido: [
          '',
          {
            validators: [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(30),
              apelidoFormatoValidator,
            ],
            asyncValidators: [this.apelidoService.disponivelValidator()],
          },
        ],
        nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(LIMITE_NOME_USUARIO)]],
        genero: ['', Validators.required],
        bio: ['', [Validators.maxLength(300)]],
        email: ['', [Validators.required, Validators.email]],
        novoEmail: ['', [Validators.email]],
        novaSenha: ['', [Validators.minLength(8)]],
        confirmarNovaSenha: [''],
      },
      { validators: senhasIguais },
    );
  }

  previewSrc: string | null = null;
  @Output() imageChange = new EventEmitter<File | null>();
  private arquivoSelecionado: File | null = null;

  // ── Regras da foto (como as da senha) ─────────────────────────────────
  // neutro = nada escolhido; ok = verde; erro = recusada; aviso = só alerta
  regraFormato: EstadoRegra = 'neutro';
  regraPeso: EstadoRegra = 'neutro';
  regraDimensao: EstadoRegra = 'neutro';
  avisoDimensao = '';
  pesoMb = '';

  /** A foto aparece em círculo de até 180px (360px em telas de alta densidade). */
  private readonly FOTO_MIN_PX = 400;

  iconeRegra(estado: EstadoRegra): string {
    return {
      neutro: 'fa-solid fa-circle-info',
      ok: 'fa-solid fa-circle-check',
      erro: 'fa-solid fa-circle-xmark',
      aviso: 'fa-solid fa-triangle-exclamation',
    }[estado];
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.regraFormato = ['image/png', 'image/jpeg'].includes(file.type) ? 'ok' : 'erro';
    this.regraPeso = file.size <= 3 * 1024 * 1024 ? 'ok' : 'erro';
    this.pesoMb = (file.size / 1024 / 1024).toFixed(1).replace('.', ',');
    this.regraDimensao = 'neutro';
    this.avisoDimensao = '';

    // Formato ou peso errado: a foto é recusada (a regra fica vermelha)
    if (this.regraFormato === 'erro' || this.regraPeso === 'erro') {
      input.value = '';
      this.arquivoSelecionado = null;
      this.emitFile();
      return;
    }

    this.arquivoSelecionado = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewSrc = reader.result as string;
      this.conferirDimensoes(this.previewSrc);
    };
    reader.readAsDataURL(file);

    this.emitFile();
  }

  /** Dimensões não bloqueiam: só avisam se ficar embaçada ou cortada. */
  private conferirDimensoes(src: string) {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const menor = Math.min(w, h);
      const quadrada = Math.abs(w - h) / Math.max(w, h) <= 0.1;

      if (menor < this.FOTO_MIN_PX) {
        this.regraDimensao = 'aviso';
        this.avisoDimensao = `(a sua tem ${w} × ${h} px e pode ficar embaçada)`;
      } else if (!quadrada) {
        this.regraDimensao = 'aviso';
        this.avisoDimensao = `(a sua tem ${w} × ${h} px; as bordas serão cortadas no círculo)`;
      } else {
        this.regraDimensao = 'ok';
      }
    };
    img.src = src;
  }

  clearPreview() {
    this.previewSrc = null;
    this.arquivoSelecionado = null;
  }

  emitFile() {
    this.imageChange.emit(this.arquivoSelecionado);
  }

  hasPreview(src: string | null | undefined): boolean {
    return !!src && src.trim() !== '';
  }

  idUser: number = 0;
  apelidoErros = APELIDO_ERROS;

  ngOnInit() {
    // O usuário vem do login, não da URL (/perfil/editar)
    this.idUser = Number(this.auth.user()?.id ?? 0);
    if (!this.idUser) return;

    this.usuarioService.buscarUserPorId(this.idUser).subscribe((response) => {
      const user = response.usuario;
      if (!user) return;

      this.user = user;
      this.carregarUsuario(user);

      this.form.patchValue({
        email: user.email,
        nome: user.nome,
        apelido: user.apelido,
        genero: user.genero,
        bio: user.bio,
      });
    });
  }

  carregarUsuario(user?: User) {
    if (user?.foto_perfil) {
      this.previewSrc = user.foto_perfil;
    }
  }

  editarPerfil() {
    this.form.markAllAsTouched();

    if (this.form.pending) {
      // Ainda conferindo o apelido no servidor
      return;
    }

    if (this.form.invalid) {
      const primeiroErro = document.querySelector('.input-error');
      primeiroErro?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      this.modalService.open({
        type: 'warning',
        title: 'Atenção',
        message: 'Corrija os campos em vermelho antes de salvar.',
      });

      return;
    }

    const payload: User = {
      ...this.user,
      ...this.form.value,
    };

    this.usuarioService
      .editarUsuario(this.idUser, payload, this.arquivoSelecionado!)
      .subscribe({
        next: (res) => {
          if (res?.success) {
            // Mantém menu, abas e "Ver meu perfil" com o apelido/nome novos
            this.auth.atualizarUsuario({
              nome: payload.nome,
              apelido: payload.apelido,
            });
            this.modalService.open({
              type: 'success',
              title: 'Perfil atualizado',
              message: 'Suas informações foram salvas com sucesso!',
              confirmText: 'OK',
              onConfirm: () => {
                this.router.navigate(['/perfil/editar']);
              },
            });
          } else {
            if (res?.campo === 'apelido') {
              this.form.get('apelido')?.setErrors({ apelidoEmUso: true });
            }
            this.modalService.open({
              type: 'error',
              title: 'Erro',
              message: res?.mensagem || 'Erro ao atualizar perfil.',
            });
          }
        },
        error: (err) => {
          this.logger.error('Erro ao atualizar perfil:', err);
          this.modalService.open({
            type: 'error',
            title: 'Erro',
            message: 'Erro de comunicação com o servidor.',
          });
        },
      });
  }
}