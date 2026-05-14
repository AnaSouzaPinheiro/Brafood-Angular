import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Perfil } from "../../profile/perfil/perfil";

@Component({
  selector: 'bra-add-recipe-hub',
  imports: [Perfil],
  templateUrl: './add-recipe-hub.html',
  styleUrl: './add-recipe-hub.scss',
})
export class AddRecipeHub {
  constructor(private router: Router) {}

  goManual() {
    this.router.navigate(['/adicionar-receita']);
  }

  goAI() {
    this.router.navigate(['/adicionar-receita/ai']);
  }
}
