import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { PwaInstallService } from '../../services/pwa-install/pwa-install.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Categoria } from '../../model/categoria';
import { AuthService } from '../../services/auth/auth.service';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { NewsletterService } from '../../services/newsletter/newsletter.service';
import { toSlug } from '../../utils/slug';

@Component({
  selector: 'bra-footer',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  logado = false;
  userId: string | null = null;
  categorias: Categoria[] = [];

  // Newsletter
  newsletterEmail = '';
  newsletterStatus: 'idle' | 'loading' | 'success' | 'error' | 'duplicate' =
    'idle';
  newsletterMsg = '';

  pwa = inject(PwaInstallService);

  constructor(
    public auth: AuthService,
    private categoriaServices: CategoriaService,
    private newsletterService: NewsletterService,
  ) {}

  ngOnInit() {
    this.logado = this.auth.isLoggedIn();

    const usuarioLogado = this.auth.user();
    this.userId = usuarioLogado?.id ?? null;

    this.categoriaServices.listCats().subscribe((categorias) => {
      this.categorias = categorias.map((c: Categoria) => ({
        id: c.id,
        nome: c.nome,
        icone: c.icone,
        fundo: '',
        css_class: c.css_class,
        ordem: c.ordem,
        url: `/categoria/${toSlug(c.nome)}/${c.id}`,
        subcategorias: c.subcategorias ?? [],
      }));
    });
  }

  logout() {
    this.auth.logout();
    location.reload();
  }

  inscreverNewsletter() {
    const email = this.newsletterEmail.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.newsletterStatus = 'error';
      this.newsletterMsg = 'Informe um e-mail válido.';
      return;
    }

    this.newsletterStatus = 'loading';

    this.newsletterService.inscrever(email).subscribe({
      next: (res) => {
        this.newsletterStatus = 'success';
        this.newsletterMsg = res.mensagem || 'Inscrição realizada!';
        this.newsletterEmail = '';
      },
      error: (err) => {
        const status = err?.status;
        if (status === 409) {
          this.newsletterStatus = 'duplicate';
          this.newsletterMsg = 'Este e-mail já está inscrito.';
        } else {
          this.newsletterStatus = 'error';
          this.newsletterMsg = 'Erro ao inscrever. Tente novamente.';
        }
      },
    });
  }

  resetNewsletter() {
    this.newsletterStatus = 'idle';
    this.newsletterMsg = '';
    this.newsletterEmail = '';
  }
}