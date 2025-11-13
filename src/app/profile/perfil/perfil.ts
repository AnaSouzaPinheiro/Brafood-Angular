import { Component } from '@angular/core';
import { UserIcon } from "../../core/user-icon/user-icon";
import { CustomButton } from '../../shared/custom-button/custom-button';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MyRecipesService } from '../../services/my-recipes';
import { User } from '../../model/user';

@Component({
  selector: 'bra-perfil',
  imports: [UserIcon, CustomButton, RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil {
  user!: User;

  constructor(
    private route: ActivatedRoute,
    private myRecipesServices: MyRecipesService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.myRecipesServices.buscarUserPorId(id).subscribe((s: any) => {
      this.user = {
        id: Number(s.id),
        nome: s.nome,
        sobrenome: s.sobrenome,
        apelido: s.apelido,
        email: s.email,
        genero: s.genero,
        bio: s.bio,
        foto_perfil: s.foto_perfil,
      };
    });
  }

  /*person = {
    photoUrl: 'assets/imagens/icones/pessoas.png',
    name: 'Ana Letícia',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  };*/
}
