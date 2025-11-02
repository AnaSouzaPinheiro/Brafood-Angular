import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-input-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-images.html',
  styleUrls: ['./input-images.scss'],
})
export class InputImages {
  previewSrc1: string | null = null;
  previewSrc2: string | null = null;
  previewSrc3: string | null = null;

  onFileChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.clearPreview(index);
      return;
    }

    const file = input.files[0];

    // Validação do tipo
    const validTypes = ['image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Formato inválido! Apenas PNG e JPG são permitidos.');
      input.value = ''; // limpa o input
      this.clearPreview(index);
      return;
    }

    // Validação do tamanho (3MB)
    const maxSize = 3 * 1024 * 1024; // bytes
    if (file.size > maxSize) {
      alert('Arquivo muito grande! O tamanho máximo é 3MB.');
      input.value = ''; // limpa o input
      this.clearPreview(index);
      return;
    }

    // Se passou nas validações, gera o preview
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      switch (index) {
        case 1:
          this.previewSrc1 = result;
          break;
        case 2:
          this.previewSrc2 = result;
          break;
        case 3:
          this.previewSrc3 = result;
          break;
      }
    };

    reader.readAsDataURL(file);
  }

  clearPreview(index: number) {
    switch (index) {
      case 1:
        this.previewSrc1 = null;
        break;
      case 2:
        this.previewSrc2 = null;
        break;
      case 3:
        this.previewSrc3 = null;
        break;
    }
  }

  hasPreview(src: string | null | undefined): boolean {
    return !!src && src.trim() !== '';
  }
}
