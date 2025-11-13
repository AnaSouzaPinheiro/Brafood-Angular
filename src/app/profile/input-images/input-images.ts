import { Component, EventEmitter, Output } from '@angular/core';
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

  @Output() imagesChange = new EventEmitter<File[]>();

  private arquivosSelecionados: File[] = [];

  onFileChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.clearPreview(index);
      this.emitFiles();
      return;
    }

    // Validação do tipo
    const file = input.files[0];
    const validTypes = ['image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Formato inválido! Apenas PNG e JPG são permitidos.');
      input.value = ''; // limpa o input
      this.clearPreview(index);
      this.emitFiles();
      return;
    }

    // Validação do tamanho (3MB)
    const maxSize = 3 * 1024 * 1024; // bytes
    if (file.size > maxSize) {
      alert('Arquivo muito grande! Máx 3MB.');
      input.value = '';
      this.clearPreview(index);
      this.emitFiles();
      return;
    }

    // Se passou nas validações, gera o preview
    const reader = new FileReader();
    reader.onload = () => {
      switch (index) {
        case 1:
          this.previewSrc1 = reader.result as string;
          break;
        case 2:
          this.previewSrc2 = reader.result as string;
          break;
        case 3:
          this.previewSrc3 = reader.result as string;
          break;
      }
    };
    reader.readAsDataURL(file);

    // salvar no array de arquivos
    this.arquivosSelecionados[index - 1] = file;
    this.emitFiles();
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
    delete this.arquivosSelecionados[index - 1];
  }

  emitFiles() {
    // envia apenas arquivos existentes
    this.imagesChange.emit(this.arquivosSelecionados.filter((f) => !!f));
  }

  hasPreview(src: string | null | undefined): boolean {
    return !!src && src.trim() !== '';
  }
}
