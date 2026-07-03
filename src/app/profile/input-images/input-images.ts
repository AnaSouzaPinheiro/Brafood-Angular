import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalService } from '../../services/modal/modal.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';

export interface GaleriaChangeEvent {
  /** Caminhos (URLs relativas) de imagens já existentes que o usuário manteve */
  mantidas: string[];
  /** Arquivos novos selecionados nesta sessão, ainda não enviados */
  novas: File[];
}

const TIPOS_VALIDOS = ['image/png', 'image/jpeg'];
const TAMANHO_MAXIMO = 3 * 1024 * 1024; // 3MB

@Component({
  selector: 'bra-input-images',
  standalone: true,
  imports: [CommonModule, MediaUrlPipe],
  templateUrl: './input-images.html',
  styleUrls: ['./input-images.scss'],
})
export class InputImages {
  // Capa (imagem principal, obrigatória)
  @Input() initialCapa: string | null = null;

  // Galeria (0..N imagens adicionais)
  @Input() initialGaleria: string[] = [];

  // Total de imagens permitido, contando a capa
  @Input() maxImagens = 8;

  @Output() capaChange = new EventEmitter<File | null>();
  @Output() galeriaChange = new EventEmitter<GaleriaChangeEvent>();

  previewCapa: string | null = null;
  private capaFile: File | null = null;

  // Imagens existentes (vindas do banco) que o usuário optou por manter
  galeriaExistente: string[] = [];

  // Novos arquivos escolhidos nesta sessão (ainda não enviados)
  galeriaNovosArquivos: File[] = [];
  galeriaNovosPreviews: string[] = [];

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.previewCapa = this.initialCapa;
    this.galeriaExistente = [...(this.initialGaleria ?? [])];
  }

  ngOnChanges() {
    if (this.initialCapa !== undefined) {
      this.previewCapa = this.initialCapa;
    }
    if (this.initialGaleria !== undefined) {
      this.galeriaExistente = [...(this.initialGaleria ?? [])];
    }
  }

  get totalAtual(): number {
    return (
      (this.previewCapa ? 1 : 0) +
      this.galeriaExistente.length +
      this.galeriaNovosArquivos.length
    );
  }

  get podeAdicionarMais(): boolean {
    return this.totalAtual < this.maxImagens;
  }

  hasPreview(src: string | null | undefined): boolean {
    return !!src && src.trim() !== '';
  }

  // ─── Capa ───────────────────────────────────────────────────────────────

  onCapaChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.previewCapa = this.initialCapa;
      this.capaFile = null;
      this.capaChange.emit(null);
      return;
    }

    if (!this.arquivoValido(file)) {
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.previewCapa = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.capaFile = file;
    this.capaChange.emit(file);
  }

  // ─── Galeria ────────────────────────────────────────────────────────────

  onGaleriaFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const arquivos = input.files ? Array.from(input.files) : [];

    if (arquivos.length === 0) return;

    const espacoDisponivel = this.maxImagens - this.totalAtual;
    if (espacoDisponivel <= 0) {
      this.modalService.open({
        type: 'error',
        title: 'Limite de imagens',
        message: `Você pode adicionar no máximo ${this.maxImagens} imagens por receita.`,
      });
      input.value = '';
      return;
    }

    const aceitos = arquivos.slice(0, espacoDisponivel);
    if (arquivos.length > aceitos.length) {
      this.modalService.open({
        type: 'error',
        title: 'Limite de imagens',
        message: `Só foi possível adicionar ${aceitos.length} imagem(ns) — o máximo é ${this.maxImagens} no total.`,
      });
    }

    for (const file of aceitos) {
      if (!this.arquivoValido(file)) continue;

      const reader = new FileReader();
      reader.onload = () => {
        this.galeriaNovosPreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);

      this.galeriaNovosArquivos.push(file);
    }

    input.value = '';
    this.emitGaleria();
  }

  removerExistente(index: number) {
    this.galeriaExistente.splice(index, 1);
    this.emitGaleria();
  }

  removerNova(index: number) {
    this.galeriaNovosArquivos.splice(index, 1);
    this.galeriaNovosPreviews.splice(index, 1);
    this.emitGaleria();
  }

  private emitGaleria() {
    this.galeriaChange.emit({
      mantidas: [...this.galeriaExistente],
      novas: [...this.galeriaNovosArquivos],
    });
  }

  private arquivoValido(file: File): boolean {
    if (!TIPOS_VALIDOS.includes(file.type)) {
      this.modalService.open({
        type: 'error',
        title: 'Erro',
        message: 'Formato inválido! Apenas PNG e JPG são permitidos.',
      });
      return false;
    }

    if (file.size > TAMANHO_MAXIMO) {
      this.modalService.open({
        type: 'error',
        title: 'Erro',
        message: 'Arquivo muito grande! Máx 3MB.',
      });
      return false;
    }

    return true;
  }
}
