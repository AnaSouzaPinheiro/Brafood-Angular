import { Component } from '@angular/core';
import { LegalPage } from '../../shared/legal-page/legal-page';

@Component({
  selector: 'bra-privacidade',
  imports: [LegalPage],
  templateUrl: './privacidade.html',
  styleUrl: './privacidade.scss',
})
export class Privacidade {
  intro = 'Esta Política explica quais dados o BraFood coleta, como eles são usados e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Última atualização: 8 de novembro de 2026.';

  sections = [
    {
      title: '1. Quem cuida dos seus dados',
      content:
        'O BraFood é um projeto pessoal mantido por uma desenvolvedora independente, que é a responsável pelos seus dados. Para qualquer assunto sobre privacidade, escreva para anapinheirole@gmail.com.',
    },
    {
      title: '2. Dados que coletamos',
      content:
        '• Cadastro: nome, apelido, e-mail e senha (a senha é guardada criptografada).\n• Perfil: foto, se você enviar uma.\n• Uso do site: receitas, fotos, comentários, avaliações, receitas salvas, quadros, marcações "quero fazer" / "já fiz" e notas pessoais.\n• Newsletter: o e-mail informado, se você se inscrever.\n• Contato: nome, e-mail e mensagem enviados pelo formulário de contato.',
    },
    {
      title: '3. Para que usamos',
      content:
        'Para criar e manter sua conta, exibir e organizar suas receitas e quadros, permitir comentários e avaliações, recuperar sua senha, responder mensagens de contato e enviar a newsletter a quem se inscreveu. Não vendemos dados e não os usamos para publicidade.',
    },
    {
      title: '4. O que fica público',
      content:
        'Seu apelido, nome, foto de perfil, receitas publicadas, comentários e avaliações ficam visíveis para outras pessoas. Quadros são privados por padrão; se você tornar um quadro público, qualquer pessoa com o link (ou que visite seu perfil) pode vê-lo. Seu e-mail, suas notas pessoais e suas marcações "quero fazer" / "já fiz" não ficam públicos.',
    },
    {
      title: '5. Serviços de terceiros',
      content:
        'Para funcionar, o BraFood conta com alguns serviços de apoio, que usam seus dados apenas para fazer a sua parte:\n• Manter o site e as informações no ar.\n• Enviar e-mails (recuperação de senha e respostas de contato).\n• Criar receitas com inteligência artificial: o texto ou a imagem que você envia é usado apenas para gerar o rascunho. O BraFood não guarda esse pedido; só fica salva a receita que você decidir publicar.\n• Carregar o visual das letras do site.\nEsses serviços não usam seus dados para anúncios e podem estar fora do Brasil.',
    },
    {
      title: '6. Por que podemos usar seus dados',
      content:
        'Usamos os dados da sua conta porque eles são necessários para oferecer o serviço que você pediu ao se cadastrar. A newsletter só é enviada com a sua autorização, que pode ser cancelada a qualquer momento.',
    },
    {
      title: '7. Por quanto tempo guardamos',
      content:
        'Enquanto sua conta existir. Se você pedir a exclusão da conta, seus dados pessoais e conteúdos são apagados, exceto o que precisar ser mantido por obrigação legal.',
    },
    {
      title: '8. Segurança',
      content:
        'Seus dados trafegam de forma protegida, a senha é guardada criptografada e só a responsável pelo site tem acesso às informações. Nenhum sistema é totalmente livre de falhas, mas, se acontecer algum problema importante, você será avisado.',
    },
    {
      title: '9. Seus direitos',
      content:
        'Você pode pedir a qualquer momento: confirmação e acesso aos seus dados, correção, exclusão da conta e dos dados, uma cópia dos seus dados e o cancelamento da newsletter. Parte disso pode ser feita direto no seu perfil; o restante, pelo e-mail anapinheirole@gmail.com.',
    },
    {
      title: '10. Alterações',
      content:
        'Esta Política pode ser atualizada. A data da última atualização fica no topo desta página.',
    },
  ];
}
