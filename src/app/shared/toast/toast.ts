import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'bra-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast implements OnInit, OnDestroy {
  toast: ToastMessage | null = null;
  visible = false;
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toast$.subscribe((t) => {
      this.toast = t;
      this.visible = !!t;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get icon(): string {
    switch (this.toast?.type) {
      case 'success':
        return 'fa-circle-check';
      case 'error':
        return 'fa-circle-xmark';
      default:
        return 'fa-circle-info';
    }
  }
}
