import { Component } from '@angular/core';
import { LegalPage } from '../../shared/legal-page/legal-page';

@Component({
  selector: 'bra-termos',
  imports: [LegalPage],
  templateUrl: './termos.html',
  styleUrl: './termos.scss',
})
export class Termos {
  intro = 'Estes Termos explicam as regras para usar o BraFood. Última atualização: 8 de novembro de 2026.';

  sections = [
    {
      title: '1. Sobre o BraFood',
      content:
        'O BraFood é um projeto pessoal, gratuito e sem fins lucrativos, criado e mantido por uma desenvolvedora independente. Não é uma empresa e não exibe anúncios. Ainda assim, qualquer pessoa pode criar uma conta e usar a plataforma.',
    },
    {
      title: '2. Aceitação',
      content:
        'Ao criar uma conta ou usar o BraFood, você concorda com estes Termos e com a Política de Privacidade. Se não concordar, não utilize a plataforma.',
    },
    {
      title: '3. Sua conta',
      content:
        'Você é responsável pelas informações do cadastro e por manter sua senha em segurança. Avise pelo e-mail de contato se suspeitar de uso indevido da sua conta.',
    },
    {
      title: '4. Suas receitas e conteúdos',
      content:
        'As receitas, fotos, comentários e avaliações que você publica continuam sendo seus. Ao publicá-los, você autoriza o BraFood a exibi-los na plataforma e garante que tem o direito de compartilhá-los (por exemplo, que as fotos são suas ou de uso permitido).',
    },
    {
      title: '5. Regras de convivência',
      content:
        'Não é permitido publicar conteúdo ofensivo, discriminatório, ilegal, enganoso, spam ou que viole direitos de terceiros. O BraFood pode remover conteúdos ou suspender contas que descumpram estas regras.',
    },
    {
      title: '6. Receitas geradas com IA',
      content:
        'O BraFood oferece uma ferramenta que gera um rascunho de receita com inteligência artificial. O resultado pode conter erros de quantidades, tempos ou ingredientes: revise tudo antes de publicar. Quem publica é responsável pelo conteúdo final.',
    },
    {
      title: '7. Alimentação e segurança',
      content:
        'As receitas são compartilhadas por usuários e servem como inspiração. Elas não substituem orientação de nutricionista ou médico. Verifique os ingredientes em caso de alergias, intolerâncias ou restrições alimentares e siga boas práticas de higiene e preparo.',
    },
    {
      title: '8. Disponibilidade',
      content:
        'Por ser um projeto pessoal em hospedagem gratuita, o BraFood pode ficar fora do ar, mudar funcionalidades ou ser encerrado sem aviso prévio. Não há garantia de disponibilidade contínua nem de backup do seu conteúdo.',
    },
    {
      title: '9. Limitação de responsabilidade',
      content:
        'O BraFood não se responsabiliza pelo resultado das receitas, por conteúdos publicados por outros usuários nem por danos decorrentes do uso da plataforma, dentro do que a lei permite.',
    },
    {
      title: '10. Alterações destes Termos',
      content:
        'Estes Termos podem ser atualizados. A data da última atualização fica no topo desta página.',
    },
    {
      title: '11. Lei aplicável e contato',
      content:
        'Estes Termos seguem a legislação brasileira. Dúvidas: anapinheirole@gmail.com.',
    },
  ];
}
