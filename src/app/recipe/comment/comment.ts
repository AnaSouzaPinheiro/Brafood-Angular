import { Component, EventEmitter, input, Output } from '@angular/core';
import { UserIcon } from "../../core/user-icon/user-icon";
import { BraInput } from "../../shared/input/input";
import { CustomButton } from "../../shared/custom-button/custom-button";
import { CommonModule } from '@angular/common';


export type isReply = 'normal' | 'reply' | 'replying';

@Component({
  selector: 'bra-comment',
  standalone: true,
  imports: [UserIcon, BraInput, CustomButton, CommonModule],
  templateUrl: './comment.html',
  styleUrl: './comment.scss'
})
export class Comment {
  isReply = input<isReply>('normal');

  @Output() viewReplies = new EventEmitter();

  comment = {
      name: 'Ana Letícia',
      data: '07/08/2025',
      text: 'Adorei essa receita! Ficou deliciosa e fácil de fazer.',
      qtdReplies: 1,
    };

}
