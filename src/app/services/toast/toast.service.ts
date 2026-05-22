import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  // Subject (não BehaviorSubject) — não emite valor inicial,
  // não mantém observable ativo, não bloqueia isStable()
  readonly toast$ = new Subject<ToastMessage | null>();

  private timer: any;

  constructor(private ngZone: NgZone) {}

  show(text: string, type: ToastMessage['type'] = 'success', duration = 3000) {
    clearTimeout(this.timer);
    this.toast$.next({ text, type });

    // Timer fora da zona do Angular para não impedir isStable()
    this.ngZone.runOutsideAngular(() => {
      this.timer = setTimeout(() => {
        this.ngZone.run(() => this.toast$.next(null));
      }, duration);
    });
  }

  hide() {
    clearTimeout(this.timer);
    this.toast$.next(null);
  }
}
