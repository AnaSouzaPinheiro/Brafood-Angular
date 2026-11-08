import { Component } from '@angular/core';
import { LegalPage } from "../../shared/legal-page/legal-page";

@Component({
  selector: 'bra-cookies',
  imports: [LegalPage],
  templateUrl: './cookies.html',
  styleUrl: './cookies.scss',
})
export class Cookies {
  intro = 'Esta Política explica o que o BraFood guarda no seu navegador e por quê. Última atualização: 8 de novembro de 2026.';

  sections = [
    {
      title: '1. Resumo',
      content:
        'O BraFood não usa cookies para anúncios nem para acompanhar o que você faz na internet. Só fica guardado no seu navegador o que é necessário para o site funcionar.',
    },
    {
      title: '2. O que fica guardado no seu navegador',
      content:
        'Quando você entra na sua conta, o site guarda neste navegador, neste dispositivo, as informações que mantêm você conectado. Ao sair da conta, elas são apagadas. Os itens que você marca na lista de compras também ficam guardados só neste navegador.',
    },
    {
      title: '3. Cookie da hospedagem',
      content:
        'O serviço que mantém o site no ar grava um cookie para confirmar que quem está acessando é uma pessoa, e não um programa automático. Sem ele, o site não abre.',
    },
    {
      title: '4. Serviços de terceiros',
      content:
        'O visual das letras do site (as fontes) é carregado de um serviço externo. Para entregar esses arquivos, ele recebe informações básicas da sua conexão.',
    },
    {
      title: '5. Consentimento',
      content:
        'Como tudo o que é guardado é essencial para o funcionamento do site, não é necessário pedir consentimento. Esta página existe para você saber o que acontece.',
    },
    {
      title: '6. Como apagar',
      content:
        'Você pode apagar os cookies e os dados de sites nas configurações do seu navegador. Ao fazer isso, você sai da sua conta e perde os itens marcados na lista de compras.',
    },
    {
      title: '7. Contato',
      content:
        'Dúvidas: anapinheirole@gmail.com.',
    },
  ];
}
