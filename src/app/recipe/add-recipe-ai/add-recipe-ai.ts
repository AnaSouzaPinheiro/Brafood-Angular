import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AiService } from '../../services/ai/ai.service';
import { BraInput } from '../../shared/input/input';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { CommonModule } from '@angular/common';
import { Perfil } from '../../profile/perfil/perfil';

const MIN_CHARS_AI = 200;

@Component({
  selector: 'bra-add-recipe-ai',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BraInput, CustomButton, Perfil],
  templateUrl: './add-recipe-ai.html',
  styleUrl: './add-recipe-ai.scss',
})
export class AddRecipeAi {
  form: FormGroup;

  recognition: any;
  isListening = false;
  finalTranscript = '';

  loading = false;

  get charCount(): number {
    return (this.form.get('textoReceita')?.value ?? '').length;
  }

  get charFaltando(): number {
    return Math.max(0, MIN_CHARS_AI - this.charCount);
  }

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      textoReceita: [
        '',
        [Validators.required, Validators.minLength(MIN_CHARS_AI)],
      ],
    });

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition não suportado neste navegador.');
      return;
    }

    this.recognition = new SpeechRecognition();

    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    // Quando começar a ouvir
    this.recognition.onstart = () => {
      this.isListening = true;
    };

    // Resultado da fala
    this.recognition.onresult = (event: any) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          this.finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      this.form.patchValue({
        textoReceita: this.finalTranscript + interim,
      });
    };

    // Quando parar por QUALQUER motivo
    this.recognition.onend = () => {
      this.isListening = false;
    };

    // Se der erro/permissão negada/etc
    this.recognition.onerror = (event: any) => {
      console.error('Erro SpeechRecognition:', event);
      this.isListening = false;
    };

    // Se o usuário parar de falar
    this.recognition.onspeechend = () => {
      this.isListening = false;
    };

    // Se o áudio acabar
    this.recognition.onaudioend = () => {
      this.isListening = false;
    };
  }

  toggleMic() {
    if (!this.recognition) return;

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.finalTranscript = this.form.get('textoReceita')?.value ?? '';

      this.recognition.start();
    }
  }

  gerarReceita() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.loading = true;

    this.aiService.generate(this.form.value.textoReceita).subscribe({
      next: (receita) => {
        localStorage.setItem('ai_recipe', JSON.stringify(receita));
        this.router.navigate(['/adicionar-receita']);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
