import { Component } from '@angular/core';
import { LegalPage } from "../../shared/legal-page/legal-page";

@Component({
  selector: 'bra-cookies',
  imports: [LegalPage],
  templateUrl: './cookies.html',
  styleUrl: './cookies.scss',
})
export class Cookies {
  sections = [
    {
      title: '1. O que são Cookies?',
      content:
        'Cookies são pequenos arquivos armazenados no dispositivo do usuário que permitem reconhecer preferências e melhorar a experiência de navegação.',
    },
    {
      title: '2. Tipos de Cookies Utilizados',
      content:
        'Utilizamos cookies essenciais para o funcionamento da plataforma, como autenticação e manutenção de sessão.',
    },
    {
      title: '3. Finalidade',
      content:
        'Os cookies são utilizados para garantir o correto funcionamento do site, melhorar a usabilidade e oferecer uma experiência personalizada ao usuário.',
    },
    {
      title: '4. Consentimento',
      content:
        'Ao continuar utilizando a plataforma, o usuário concorda com o uso de cookies, conforme descrito nesta política.',
    },
    {
      title: '5. Gerenciamento de Cookies',
      content:
        'O usuário pode, a qualquer momento, configurar seu navegador para recusar ou excluir cookies, ciente de que isso pode impactar algumas funcionalidades da plataforma.',
    },
  ];
}
