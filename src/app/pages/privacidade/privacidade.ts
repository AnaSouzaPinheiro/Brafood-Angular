import { Component } from '@angular/core';
import { LegalPage } from '../../shared/legal-page/legal-page';

@Component({
  selector: 'bra-privacidade',
  imports: [LegalPage],
  templateUrl: './privacidade.html',
  styleUrl: './privacidade.scss',
})
export class Privacidade {
  sections = [
    {
      title: '1. Coleta de Dados Pessoais',
      content:
        'Coletamos dados pessoais fornecidos diretamente pelo usuário, como nome, e-mail e demais informações necessárias para utilização da plataforma.',
    },
    {
      title: '2. Finalidade do Tratamento',
      content:
        'Os dados pessoais são utilizados para viabilizar o funcionamento da plataforma, melhorar a experiência do usuário, autenticação de conta e comunicação.',
    },
    {
      title: '3. Base Legal',
      content:
        'O tratamento de dados é realizado com base no consentimento do usuário e/ou na execução de contrato, conforme previsto na Lei Geral de Proteção de Dados (Lei nº 13.709/2018).',
    },
    {
      title: '4. Compartilhamento de Dados',
      content:
        'Os dados pessoais não são compartilhados com terceiros, exceto quando necessário para cumprimento de obrigações legais ou para o funcionamento da plataforma.',
    },
    {
      title: '5. Armazenamento e Segurança',
      content:
        'Adotamos medidas técnicas e organizacionais para proteger os dados pessoais contra acesso não autorizado, perda ou destruição.',
    },
    {
      title: '6. Direitos do Titular',
      content:
        'O usuário pode, a qualquer momento, solicitar acesso, correção ou exclusão de seus dados pessoais, conforme previsto na LGPD.',
    },
    {
      title: '7. Contato',
      content:
        'Para dúvidas ou solicitações relacionadas à privacidade, entre em contato através dos canais disponíveis na plataforma.',
    },
  ];
}
