import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { BraInput } from '../../shared/input/input';
import { User } from '../../model/user';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../../services/modal/modal.service';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { Perfil } from "../perfil/perfil";

@Component({
  selector: 'bra-editar-perfil',
  imports: [
    BraInput,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    CustomButton,
    Perfil
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
  ) {
    this.form = this.fb.group({
      apelido: ['', Validators.required],
      nome: ['', Validators.required],
      sobrenome: ['', Validators.required],
      genero: ['', Validators.required],
      bio: [''],
      email: ['', [Validators.required, Validators.email]],
      novoEmail: ['', [Validators.email]],
      novaSenha: [''],
      confirmarNovaSenha: [''],
    });
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

    // tipo
    const validTypes = ['image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Formato inválido! Apenas PNG e JPG são permitidos.');
      input.value = '';
      this.clearPreview();
      this.emitFile();
      return;
    }

    // tamanho (3MB)
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande! Máx 3MB.');
      input.value = '';
      this.clearPreview();
      this.emitFile();
      return;
    }

    // passou nas validações
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

    this.usuarioService.buscarUserPorId(this.idUser).subscribe((user: User) => {
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.modalService.open({
        type: 'warning',
        title: 'Atenção',
        message: 'Existem campos obrigatórios não preenchidos.',
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
          if (res?.sucesso) {
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
          console.error(err);
          alert('Erro de comunicação com o servidor.');
        },
      });
  }
}
