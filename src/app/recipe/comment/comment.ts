import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserIcon } from '../../core/user-icon/user-icon';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { CommonModule } from '@angular/common';
import { Comentario } from '../../model/comentario';
import { FormsModule } from '@angular/forms';

export type CommentState = 'normal' | 'reply' | 'replying';

const MIN_CHARS = 3;

@Component({
  selector: 'bra-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, UserIcon, CustomButton],
  templateUrl: './comment.html',
  styleUrl: './comment.scss',
})
export class Comment {
  @Input() comment!: Comentario;

  @Output() sendReply = new EventEmitter<{
    texto: string;
    id_comentario_pai: number;
    foto_perfil: string;
  }>();

  replying = false;
  textoResposta = '';
  tentouEnviarResposta = false;
  showReplies = false;
  visibleRepliesCount = 3;

  isReply() {
    return !!this.comment.id_comentario_pai;
  }

  responder() {
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
    this.tentouEnviarResposta = true;

    if (this.textoResposta.trim().length < MIN_CHARS) return;

    this.sendReply.emit({
      texto: this.textoResposta,
      id_comentario_pai: this.comment.id,
      foto_perfil: this.comment.foto_perfil ?? '',
    });

    this.showReplies = true;
    this.cancelar();
  }

  toggleReplies() {
    this.showReplies = true;
  }

  verMaisRespostas() {
    this.visibleRepliesCount += 3;
  }
}
