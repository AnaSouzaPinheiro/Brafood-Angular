import { Component } from '@angular/core';
import { Perfil } from '../perfil/perfil';
import { CustomButton } from "../../shared/custom-button/custom-button";

@Component({
  selector: 'bra-editar-perfil',
  imports: [Perfil, CustomButton],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.scss'
})
export class EditarPerfil {

}
