import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'bra-category-bar',
  standalone: true,
  templateUrl: './category-bar.html',
  styleUrls: ['./category-bar.scss'],
  imports: [CommonModule, RouterModule],
})

export class CategoryBar {
  categories = [
    {
      name: 'Comemorativas',
      icon: 'assets/imagens/icones/prato.png',
      cssClass: 'bg-especiais',
      /*url: ,*/
    },
    {
      name: 'Café da Manhã & Lanches',
      icon: 'assets/imagens/icones/croissant.png',
      cssClass: 'bg-cafe',
      /*url: ,*/
    },
    {
      name: 'Pratos Principais',
      icon: 'assets/imagens/icones/plate.png',
      cssClass: 'bg-principais',
      /*url: ,*/
    },
    {
      name: 'Vegetarianas & Veganas',
      icon: 'assets/imagens/icones/eco-amigavel.png',
      cssClass: 'bg-vegan',
      /*url: ,*/
    },
    {
      name: 'Sopas & Caldos',
      icon: 'assets/imagens/icones/sopa-quente.png',
      cssClass: 'bg-sopas',
      /*url: ,*/
    },
    {
      name: 'Sobremesas',
      icon: 'assets/imagens/icones/bolo.png',
      cssClass: 'bg-sobremesas',
      /*url: ,*/
    },
    {
      name: 'Bebidas',
      icon: 'assets/imagens/icones/coquetel (1).png',
      cssClass: 'bg-bebidas',
      /*url: ,*/
    },
  ];
}
