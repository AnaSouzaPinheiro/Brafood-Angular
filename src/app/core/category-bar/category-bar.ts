import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    Inject,
    OnDestroy,
    PLATFORM_ID,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Categoria } from '../../model/categoria';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { toSlug } from '../../utils/slug';

// Acima disso, vira carrossel automático. Abaixo, mantém o scroll manual
// (arraste/touch) que já existia — é o comportamento de mobile/tablet.
const DESKTOP_BREAKPOINT = 992;
const SCROLL_SPEED_PX_POR_SECOND = 30;
// Quanto cada clique na seta avança (px) e a partir de quantos px de
// movimento um "clique" passa a ser considerado arraste.
const ARROW_STEP_PX = 320;
const DRAG_THRESHOLD_PX = 5;

@Component({
  selector: 'bra-category-bar',
  standalone: true,
  templateUrl: './category-bar.html',
  styleUrls: ['./category-bar.scss'],
  imports: [CommonModule, RouterModule],
})
export class CategoryBar implements AfterViewInit, OnDestroy {
  @ViewChild('track') trackRef?: ElementRef<HTMLUListElement>;

  categorias: Categoria[] = [];
  isDesktop = false;

  private isBrowser: boolean;
  private paused = false;
  private rafId: number | null = null;
  private singleSetWidth = 0;
  private position = 0;
  private lastTimestamp = 0;

  // Setas: deslocamento pendente, consumido suavemente a cada frame
  private pendingOffset = 0;

  // Arraste com mouse
  private dragging = false;
  private dragMoved = false;
  private dragStartX = 0;
  private dragStartPosition = 0;

  constructor(
    private route: ActivatedRoute,
    private categoriaServices: CategoriaService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    }

    this.categoriaServices.listCats().subscribe((categorias) => {
      this.categorias = categorias
        .filter((c: Categoria) => c.subcategorias?.length > 0)
        .map((c: Categoria) => ({
          id: c.id,
          nome: c.nome,
          icone: c.icone,
          fundo: '',
          css_class: c.css_class,
          ordem: c.ordem,
          cor_primaria: c.cor_primaria,
          gradiente_hover: c.gradiente_hover,
          url: `/categoria/${toSlug(c.nome)}/${c.id}`,
          subcategorias: c.subcategorias ?? [],
        }));

      // Espera o *ngFor renderizar a lista (e a duplicata, no desktop)
      // antes de medir a largura e começar a rolar.
      if (this.isBrowser) {
        setTimeout(() => this.setupCarousel());
      }
    });
  }

  ngAfterViewInit() {
    if (!this.isBrowser || !this.trackRef) return;
    // Depois de um arraste, o "soltar" do mouse dispara um click no item
    // embaixo do cursor. Bloqueia esse click (fase de captura) para não
    // navegar sem querer.
    this.trackRef.nativeElement.addEventListener(
      'click',
      (e) => {
        if (this.dragMoved) {
          e.preventDefault();
          e.stopPropagation();
          this.dragMoved = false;
        }
      },
      true,
    );
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isBrowser) return;
    const wasDesktop = this.isDesktop;
    this.isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    if (wasDesktop !== this.isDesktop) {
      this.stopAutoScroll();
      setTimeout(() => this.setupCarousel());
    }
  }

  onMouseEnter() {
    this.paused = true;
  }

  onMouseLeave() {
    this.paused = false;
    this.endDrag();
  }

  /** Setas laterais: -1 volta, 1 avança */
  scrollStep(direction: -1 | 1) {
    this.pendingOffset += direction * ARROW_STEP_PX;
  }

  onPointerDown(event: PointerEvent) {
    if (!this.isDesktop || event.pointerType !== 'mouse' || event.button !== 0) return;
    this.dragging = true;
    this.dragMoved = false;
    this.dragStartX = event.clientX;
    this.dragStartPosition = this.position;
    this.pendingOffset = 0;
  }

  @HostListener('window:pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {
    if (!this.dragging || !this.trackRef) return;
    const delta = event.clientX - this.dragStartX;
    if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
      this.dragMoved = true;
    }
    if (this.dragMoved) {
      this.position = this.wrap(this.dragStartPosition - delta);
      this.trackRef.nativeElement.scrollLeft = this.position;
    }
  }

  @HostListener('window:pointerup')
  endDrag() {
    this.dragging = false;
  }

  get isDragging() {
    return this.dragging && this.dragMoved;
  }

  /** Mantém a posição dentro de um conjunto (loop infinito nos dois sentidos) */
  private wrap(value: number) {
    const w = this.singleSetWidth;
    if (!w) return value;
    return ((value % w) + w) % w;
  }

  private setupCarousel() {
    this.stopAutoScroll();
    if (!this.isDesktop || !this.trackRef) return;

    const track = this.trackRef.nativeElement;
    // A lista é renderizada em dobro no HTML (pra dar ilusão de loop
    // infinito); a largura de UM conjunto é metade da largura total.
    this.singleSetWidth = track.scrollWidth / 2;
    if (!this.singleSetWidth) return;

    this.position = 0;
    this.lastTimestamp = 0;
    track.scrollLeft = 0;

    this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = (timestamp: number) => {
    if (!this.trackRef) {
      return;
    }

    const track = this.trackRef.nativeElement;

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }

    const deltaTime = (timestamp - this.lastTimestamp) / 1000; // segundos
    this.lastTimestamp = timestamp;

    if (!this.dragging) {
      let move = this.paused ? 0 : SCROLL_SPEED_PX_POR_SECOND * deltaTime;

      // Consome o deslocamento das setas com desaceleração suave
      if (Math.abs(this.pendingOffset) > 0.5) {
        const step = this.pendingOffset * Math.min(1, deltaTime * 8);
        this.pendingOffset -= step;
        move += step;
      } else {
        this.pendingOffset = 0;
      }

      if (move !== 0) {
        this.position = this.wrap(this.position + move);
        track.scrollLeft = this.position;
      }
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private stopAutoScroll() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  onHover(event: MouseEvent, categoria: Categoria) {
    if (categoria.gradiente_hover) {
      (event.currentTarget as HTMLElement).style.background =
        categoria.gradiente_hover;
    }
  }

  onLeave(event: MouseEvent, categoria: Categoria) {
    const el = event.currentTarget as HTMLElement;
    el.style.background = '';
    if (categoria.cor_primaria) {
      el.style.backgroundColor = categoria.cor_primaria;
    }
  }
}
