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
import { Perfil } from "../../profile/perfil/perfil";

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

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      textoReceita: ['', Validators.required],
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

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          this.finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      this.form.patchValue({
        textoReceita:
          this.finalTranscript + interimTranscript,
      });
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  toggleMic() {
    if (!this.recognition) return;

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.recognition.start();
      this.isListening = true;
    }
  }

  gerar() {
    if (this.form.invalid) return;

    const texto = this.form.value.textoReceita;

    this.aiService.generate(texto).subscribe((res: any) => {
      localStorage.setItem('ai_recipe', JSON.stringify(res));
      this.router.navigate(['/adicionar-receita']);
    });
  }
}