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
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../model/user';
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
    sobrenome: '',
    apelido: '',
    genero: '',
    bio: '',
    foto_perfil: '',
  };

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private logger: LoggerService,
  ) {
    this.form = this.fb.group(
      {
        apelido: ['', [Validators.required, Validators.maxLength(30)]],
        nome: ['', Validators.required],
        sobrenome: ['', Validators.required],
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

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.clearPreview();
      this.emitFile();
      return;
    }

    const file = input.files[0];

    const validTypes = ['image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      this.modalService.open({
        type: 'error',
        title: 'Erro',
        message: 'Formato inválido! Apenas PNG e JPG são permitidos.',
      });
      input.value = '';
      this.clearPreview();
      this.emitFile();
      return;
    }

    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      this.modalService.open({
        type: 'error',
        title: 'Erro',
        message: 'Arquivo muito grande! Máx 3MB.',
      });
      input.value = '';
      this.clearPreview();
      this.emitFile();
      return;
    }

    this.arquivoSelecionado = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewSrc = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.emitFile();
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

  ngOnInit() {
    this.idUser = Number(this.route.snapshot.paramMap.get('id'));

    this.usuarioService.buscarUserPorId(this.idUser).subscribe((response) => {
      const user = response.usuario;
      if (!user) return;

      this.user = user;
      this.carregarUsuario(user);

      this.form.patchValue({
        email: user.email,
        nome: user.nome,
        sobrenome: user.sobrenome,
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
            this.modalService.open({
              type: 'success',
              title: 'Perfil atualizado',
              message: 'Suas informações foram salvas com sucesso!',
              confirmText: 'OK',
              onConfirm: () => {
                this.router.navigate(['/editar-perfil', this.user.id]);
              },
            });
          } else {
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