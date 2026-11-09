import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../../services/auth/auth.service';
import { DestaqueService } from '../../../../services/destaque/destaque.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { MediaUrlPipe } from '../../../../shared/pipes/media-url.pipe';

/** Aba "Destaque da Semana" do painel admin. */
@Component({
  selector: 'bra-admin-destaque',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUrlPipe],
  templateUrl: './admin-destaque.html',
  styleUrl: './admin-destaque.scss',
})
export class AdminDestaque implements OnInit {
  userId!: number;

  destaqueAtual: any = null;
  destaqueReceitas: any[] = [];
  destaqueBusca = '';
  destaqueLoading = false;
  private destaqueBuscaSubject = new Subject<string>();

  constructor(
    private auth: AuthService,
    private destaqueService: DestaqueService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId()!;
    this.carregarDestaque();

    this.destaqueBuscaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((t) => t.length >= 2 ? this.destaqueService.buscarReceitas(t) : of([])),
    ).subscribe((res) => { this.destaqueReceitas = res; });
  }

  carregarDestaque() {
    this.destaqueService.buscar().subscribe({
      next: (d) => { this.destaqueAtual = d; },
      error: () => { this.destaqueAtual = null; },
    });
  }

  onDestaqueBuscaChange() {
    this.destaqueBuscaSubject.next(this.destaqueBusca);
  }

  ativarDestaque(receita: any) {
    this.destaqueLoading = true;
    this.destaqueService.ativar(receita.id, this.userId).subscribe({
      next: () => {
        this.destaqueLoading = false;
        this.destaqueBusca = '';
        this.destaqueReceitas = [];
        this.carregarDestaque();
        this.modalService.open({ type: 'success', title: 'Destaque ativado', message: `"${receita.titulo}" é a nova receita da semana!` });
      },
      error: () => {
        this.destaqueLoading = false;
        this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao ativar destaque.' });
      },
    });
  }

  removerDestaque() {
    this.modalService.open({
      type: 'warning',
      title: 'Voltar para automático',
      message: 'Desfazer a escolha desta semana? Uma receita será escolhida automaticamente.',
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.destaqueService.remover(this.userId).subscribe({
          next: (res: any) => {
            this.destaqueAtual = res?.destaque ?? null;
            const nome = res?.destaque?.titulo;
            this.modalService.open({
              type: 'success',
              title: 'Pronto',
              message: nome
                ? `A receita da semana voltou a ser automática: agora é "${nome}".`
                : 'A receita da semana voltou a ser escolhida automaticamente.',
            });
          },
          error: () => {
            this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao remover destaque.' });
          },
        });
      },
    });
  }
}
