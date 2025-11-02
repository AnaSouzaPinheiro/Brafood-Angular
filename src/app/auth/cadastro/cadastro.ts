import { Component } from '@angular/core';
import { InputAcesso } from "../input-acesso/input-acesso";
import { CustomButton } from "../../shared/custom-button/custom-button";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'bra-cadastro',
  imports: [InputAcesso, CustomButton, RouterModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss'
})
export class Cadastro {

}
