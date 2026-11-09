import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserIcon } from '../../core/user-icon/user-icon';
import { Comentario } from '../../model/comentario';
import { AuthService } from '../../services/auth/auth.service';
import { ModalService } from '../../services/modal/modal.service';
import { CustomButton } from '../../shared/custom-button/custom-button';

export type CommentState = 'normal' | 'reply' | 'replying';

const MIN_CHARS = 3;

@Component({
  selector: 'bra-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UserIcon, CustomButton],
  templateUrl: './comment.html',
  styleUrl: './comment.scss',
})
export class Comment {
  /** Perfil público de quem comentou (/chef/{apelido}; o id também funciona). */
  get linkPerfil(): (string | number)[] {
    return ['/chef', this.comment.apelido_usuario || this.comment.id_usuario];
  }

  abrirPerfil() {
    this.router.navigate(this.linkPerfil);
  }

  @Input() comment!: Comentario;
  /** É a avaliação da própria pessoa (mostra "Sua avaliação", Editar e Excluir). */
  @Input() minha = false;
  @Output() editar = new EventEmitter<void>();

  /** O card envolve a avaliação E as respostas dela (respostas não viram card). */
  @HostBinding('class.card') get ehCard() {
    return !this.isReply();
  }

  @HostBinding('class.minha') get ehMinha() {
    return this.minha;
  }
  @Output() excluirAvaliacao = new EventEmitter<void>();

  @Output() sendReply = new EventEmitter<{
    texto: string;
    id_comentario_pai: number;
    foto_perfil: string;
    onDone: (success: boolean) => void;
  }>();

  @Output() deleteComment = new EventEmitter<{
    id: number;
    onDone: (success: boolean) => void;
  }>();

  replying = false;
  textoResposta = '';
  tentouEnviarResposta = false;
  showReplies = false;
  visibleRepliesCount = 3;
  enviandoResposta = false;
  excluindo = false;

  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router,
  ) {}

  isReply() {
    return !!this.comment.id_comentario_pai;
  }

  get podeExcluir(): boolean {
    const usuarioId = this.authService.getUserId();
    if (!usuarioId) return false;
    const isDono = Number(usuarioId) === Number(this.comment.id_usuario);
    const isAdmin = this.authService.getUser()?.is_admin === 1;
    return isDono || isAdmin;
  }

  excluir() {
    if (this.excluindo) return;

    const temRespostas = (this.comment.replies?.length || 0) > 0;

    this.modalService.open({
      type: 'confirm',
      title: 'Excluir comentário',
      message: temRespostas
        ? 'Tem certeza que quer excluir este comentário? As respostas dele também serão apagadas.'
        : 'Tem certeza que quer excluir este comentário?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.excluindo = true;
        this.deleteComment.emit({
          id: this.comment.id,
          onDone: () => {
            this.excluindo = false;
          },
        });
      },
    });
  }

  responder() {
    const usuarioId = this.authService.getUserId();

    if (!usuarioId) {
      this.modalService.open({
        type: 'confirm',
        title: 'Login necessário',
        message: 'Para responder comentários, você precisa estar logado.',
        confirmText: 'Ir para login',
        cancelText: 'Cancelar',
        onConfirm: () => {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url },
          });
        },
      });

      return;
    }

    this.replying = true;
    this.tentouEnviarResposta = false;
  }

  cancelar() {
    this.replying = false;
    this.textoResposta = '';
    this.tentouEnviarResposta = false;
  }

  get respostaInvalida(): boolean {
    return (
      this.tentouEnviarResposta && this.textoResposta.trim().length < MIN_CHARS
    );
  }

  get erroResposta(): string {
    if (!this.tentouEnviarResposta) return '';
    if (!this.textoResposta.trim()) return 'Escreva algo antes de responder.';
    if (this.textoResposta.trim().length < MIN_CHARS)
      return `Escreva pelo menos ${MIN_CHARS} caracteres.`;
    return '';
  }

  enviar() {
    if (this.enviandoResposta) return;

    this.tentouEnviarResposta = true;

    if (this.textoResposta.trim().length < MIN_CHARS) return;

    this.enviandoResposta = true;

    this.sendReply.emit({
      texto: this.textoResposta,
      id_comentario_pai: this.comment.id,
      foto_perfil: this.comment.foto_perfil ?? '',
      onDone: (success: boolean) => {
        this.enviandoResposta = false;
        if (success) {
          this.showReplies = true;
          this.cancelar();
        }
        // em caso de erro, deixa o texto no campo pra pessoa tentar de novo
      },
    });
  }

  toggleReplies() {
    this.showReplies = true;
  }

  verMaisRespostas() {
    this.visibleRepliesCount += 3;
  }
}