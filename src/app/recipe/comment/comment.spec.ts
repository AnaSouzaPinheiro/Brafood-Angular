import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { Comment } from './comment';

describe('Comment', () => {
  let component: Comment;
  let fixture: ComponentFixture<Comment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [Comment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Comment);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('comment', { id: 1, id_receita: 1, id_usuario: 1, id_comentario_pai: null, texto: 'Ótima receita!', data_criacao: '2026-01-01 10:00:00', nome_usuario: 'Ana' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
