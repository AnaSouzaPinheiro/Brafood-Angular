import { Component } from '@angular/core';
import { LegalPage } from '../../shared/legal-page/legal-page';

@Component({
  selector: 'bra-termos',
  imports: [LegalPage],
  templateUrl: './termos.html',
  styleUrl: './termos.scss',
})
export class Termos {
  sections = [
    {
      title: '1. Aceitação dos Termos',
      content:
        'Ao acessar e utilizar esta plataforma, o usuário declara que leu,compreendeu e concorda com os presentes Termos de Uso e com a Políticade Privacidade.',
    },
    {
      title: '2. Uso da Plataforma',
      content:
        'O usuário se compromete a utilizar a plataforma de forma ética,responsável e em conformidade com a legislação vigente, abstendo-se depraticar qualquer atividade ilícita ou que possa prejudicar terceiros.',
    },
    {
      title: '3. Cadastro e Conta',
      content:
        'Para acesso a determinadas funcionalidades, poderá ser necessáriorealizar cadastro, sendo o usuário responsável pela veracidade dasinformações fornecidas e pela confidencialidade de suas credenciais.',
    },
    {
      title: '4. Conteúdo do Usuário',
      content:
        'O usuário é integralmente responsável pelos conteúdos publicados naplataforma, incluindo receitas, comentários e demais informações,devendo garantir que não violem direitos de terceiros ou disposiçõeslegais.',
    },
    {
      title: '5. Limitação de Responsabilidade',
      content:
        'A plataforma não se responsabiliza por eventuais danos decorrentes douso indevido das informações disponibilizadas, nem pelo conteúdoinserido por terceiros.',
    },
    {
      title: '6. Alterações',
      content:
        'Estes Termos poderão ser atualizados a qualquer momento, sendorecomendada a sua revisão periódica pelo usuário.',
    },
  ];
}
