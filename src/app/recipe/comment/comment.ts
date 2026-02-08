import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { UserIcon } from '../../core/user-icon/user-icon';
import { BraInput } from '../../shared/input/input';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { CommonModule } from '@angular/common';
import { Comentario } from '../../model/comentario';
import { FormsModule } from '@angular/forms';

export type CommentState = 'normal' | 'reply' | 'replying';

@Component({
  selector: 'bra-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, UserIcon, BraInput, CustomButton],
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

  // estado de interação
  replying = false;

  textoResposta = '';

  // controle de replies
  showReplies = false;
  visibleRepliesCount = 3;

  // 👉 isso define o layout (normal ou reply)
  isReply() {
    return !!this.comment.id_comentario_pai;
  }

  responder() {
    this.replying = true;
  }

  cancelar() {
    this.replying = false;
    this.textoResposta = '';
  }

  enviar() {
    if (!this.textoResposta.trim()) return;

    this.sendReply.emit({
      texto: this.textoResposta,
      id_comentario_pai: this.comment.id,
      foto_perfil: this.comment.foto_perfil ?? '',
    });

    this.showReplies = true; // 👈 força abrir
    this.cancelar();
  }

  toggleReplies() {
    this.showReplies = true;
  }

  verMaisRespostas() {
    this.visibleRepliesCount += 3;
  }
}
