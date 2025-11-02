import { Component } from '@angular/core';
import { InputAcesso } from "../input-acesso/input-acesso";
import { CustomButton } from "../../shared/custom-button/custom-button";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'bra-login',
  imports: [InputAcesso, CustomButton, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

}
