import { Injectable, signal } from '@angular/core';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  user = signal<any>(null);

  login(user: User) {
    this.user.set(user);
    localStorage.setItem('user', JSON.stringify(user)); // opcional, pra manter após reload
    localStorage.setItem('userId', String(user.id));
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }

  loadFromStorage() {
    // só roda se estiver no navegador
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('user');
      if (data) {
        this.user.set(JSON.parse(data));
      }
    }
  }
}
