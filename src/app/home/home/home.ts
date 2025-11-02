import { Component } from '@angular/core';
import { RecipeSection } from '../../shared/recipe-section/recipe-section';
import { SlideHome } from '../slide-home/slide-home';

@Component({
  selector: 'bra-home',
  imports: [RecipeSection, SlideHome],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  modalLogged!: {
    personName: 'Ana Letícia';

    urlAccount: '';
    urlMyRecipes: '';
    urlMyfavs: '';
  };

  sections = [
    {
      title: 'Receitas do mês',
      urlSection: 'assets/imagens/fundos/junina.png',
      fundoTitle: 'assets/imagens/icones/Rectangle 35.png',

      recipes: [
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/delicioso-arranjo-de-doces-mexicanos.jpg',
          url: '/recipe',
          resume: {
            title: 'Pé de moleque',
            qtdFav: 258,
            text: 'Tradicional e irresistível, o pé de moleque traz a crocância do amendoim com o doce sabor do caramelo brasileiro.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/deliciosa-variedade-de-tamales-tradicionais.jpg',
          url: '/recipe',
          resume: {
            title: 'Pamonha',
            qtdFav: 312,
            text: 'Feita com milho verde ralado e cozido, a pamonha é um dos pratos mais queridos das festas juninas.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/canjica.png',
          url: '/recipe',
          resume: {
            title: 'Canjica',
            qtdFav: 185,
            text: 'A canjica cremosa combina grãos de milho branco com leite, açúcar e canela, trazendo aconchego em cada colherada.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/sobremesa-de-granita-saborosa-com-alto-angulo-laranja.jpg',
          url: '/recipe',
          resume: {
            title: 'Cuscuz doce',
            qtdFav: 97,
            text: 'Cuscuz de milho com coco e leite condensado, perfeito para adoçar a sua festa junina.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/arroz-con-leche-arroz-doce-com-canela-em-tigela-sobre-mesa-de-madeira.jpg',
          url: '/recipe',
          resume: {
            title: 'Arroz doce',
            qtdFav: 144,
            text: 'Cremoso e aromatizado com canela, o arroz doce é um clássico irresistível das festas juninas.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/bolo-e-limoes-deliciosos-de-alto-angulo.jpg',
          url: '/recipe',
          resume: {
            title: 'Bolo de fubá cremoso',
            qtdFav: 223,
            text: 'Com textura macia e sabor delicado, o bolo de fubá cremoso é presença garantida no arraial.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/arranjo-plano-de-tigelas-de-sopa-de-creme.jpg',
          url: '/recipe',
          resume: {
            title: 'Curau de milho',
            qtdFav: 201,
            text: 'Feito com milho verde e leite, o curau é doce, macio e polvilhado com canela para dar aquele toque especial.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/vinho-quente-com-canela-em-pau-e-limao.jpg',
          url: '/recipe',
          resume: {
            title: 'Quentão',
            qtdFav: 341,
            text: 'Bebida quente e aromática com gengibre, canela e cravo, ideal para aquecer as noites juninas.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/image.png',
          url: '/recipe',
          resume: {
            title: 'Maçã do amor',
            qtdFav: 289,
            text: 'Com sua casquinha de açúcar vermelha e brilhante, a maçã do amor é símbolo doce e divertido da festa.',
          },
        },
      ],
    },
    {
      title: 'Receitas de Natal',
      urlSection: '',
      fundoTitle: '',

      recipes: [
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/delicioso-arranjo-de-doces-mexicanos.jpg',
          url: '/recipe',
          resume: {
            title: 'Pé de moleque',
            qtdFav: 258,
            text: 'Tradicional e irresistível, o pé de moleque traz a crocância do amendoim com o doce sabor do caramelo brasileiro.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/deliciosa-variedade-de-tamales-tradicionais.jpg',
          url: '/recipe',
          resume: {
            title: 'Pamonha',
            qtdFav: 312,
            text: 'Feita com milho verde ralado e cozido, a pamonha é um dos pratos mais queridos das festas juninas.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/canjica.png',
          url: '/recipe',
          resume: {
            title: 'Canjica',
            qtdFav: 185,
            text: 'A canjica cremosa combina grãos de milho branco com leite, açúcar e canela, trazendo aconchego em cada colherada.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/sobremesa-de-granita-saborosa-com-alto-angulo-laranja.jpg',
          url: '/recipe',
          resume: {
            title: 'Cuscuz doce',
            qtdFav: 97,
            text: 'Cuscuz de milho com coco e leite condensado, perfeito para adoçar a sua festa junina.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/arroz-con-leche-arroz-doce-com-canela-em-tigela-sobre-mesa-de-madeira.jpg',
          url: '/recipe',
          resume: {
            title: 'Arroz doce',
            qtdFav: 144,
            text: 'Cremoso e aromatizado com canela, o arroz doce é um clássico irresistível das festas juninas.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/bolo-e-limoes-deliciosos-de-alto-angulo.jpg',
          url: '/recipe',
          resume: {
            title: 'Bolo de fubá cremoso',
            qtdFav: 223,
            text: 'Com textura macia e sabor delicado, o bolo de fubá cremoso é presença garantida no arraial.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/arranjo-plano-de-tigelas-de-sopa-de-creme.jpg',
          url: '/recipe',
          resume: {
            title: 'Curau de milho',
            qtdFav: 201,
            text: 'Feito com milho verde e leite, o curau é doce, macio e polvilhado com canela para dar aquele toque especial.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/vinho-quente-com-canela-em-pau-e-limao.jpg',
          url: '/recipe',
          resume: {
            title: 'Quentão',
            qtdFav: 341,
            text: 'Bebida quente e aromática com gengibre, canela e cravo, ideal para aquecer as noites juninas.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/image.png',
          url: '/recipe',
          resume: {
            title: 'Maçã do amor',
            qtdFav: 289,
            text: 'Com sua casquinha de açúcar vermelha e brilhante, a maçã do amor é símbolo doce e divertido da festa.',
          },
        },
      ],
    },
    {
      title: 'Receitas Veganas',
      urlSection: '',
      fundoTitle: '',

      recipes: [
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/delicioso-arranjo-de-doces-mexicanos.jpg',
          url: '/recipe',
          resume: {
            title: 'Pé de moleque',
            qtdFav: 258,
            text: 'Tradicional e irresistível, o pé de moleque traz a crocância do amendoim com o doce sabor do caramelo brasileiro.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/deliciosa-variedade-de-tamales-tradicionais.jpg',
          url: '/recipe',
          resume: {
            title: 'Pamonha',
            qtdFav: 312,
            text: 'Feita com milho verde ralado e cozido, a pamonha é um dos pratos mais queridos das festas juninas.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/canjica.png',
          url: '/recipe',
          resume: {
            title: 'Canjica',
            qtdFav: 185,
            text: 'A canjica cremosa combina grãos de milho branco com leite, açúcar e canela, trazendo aconchego em cada colherada.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/sobremesa-de-granita-saborosa-com-alto-angulo-laranja.jpg',
          url: '/recipe',
          resume: {
            title: 'Cuscuz doce',
            qtdFav: 97,
            text: 'Cuscuz de milho com coco e leite condensado, perfeito para adoçar a sua festa junina.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/arroz-con-leche-arroz-doce-com-canela-em-tigela-sobre-mesa-de-madeira.jpg',
          url: '/recipe',
          resume: {
            title: 'Arroz doce',
            qtdFav: 144,
            text: 'Cremoso e aromatizado com canela, o arroz doce é um clássico irresistível das festas juninas.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/bolo-e-limoes-deliciosos-de-alto-angulo.jpg',
          url: '/recipe',
          resume: {
            title: 'Bolo de fubá cremoso',
            qtdFav: 223,
            text: 'Com textura macia e sabor delicado, o bolo de fubá cremoso é presença garantida no arraial.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/arranjo-plano-de-tigelas-de-sopa-de-creme.jpg',
          url: '/recipe',
          resume: {
            title: 'Curau de milho',
            qtdFav: 201,
            text: 'Feito com milho verde e leite, o curau é doce, macio e polvilhado com canela para dar aquele toque especial.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/vinho-quente-com-canela-em-pau-e-limao.jpg',
          url: '/recipe',
          resume: {
            title: 'Quentão',
            qtdFav: 341,
            text: 'Bebida quente e aromática com gengibre, canela e cravo, ideal para aquecer as noites juninas.',
          },
        },
        {
          category: 'Festa Junina',
          img: 'assets/imagens/receita/image.png',
          url: '/recipe',
          resume: {
            title: 'Maçã do amor',
            qtdFav: 289,
            text: 'Com sua casquinha de açúcar vermelha e brilhante, a maçã do amor é símbolo doce e divertido da festa.',
          },
        },
      ],
    },
  ];

  recipes = [
    {
      bannerFoto:
        'assets/imagens/receita/vista-lateral-de-bife-grelhado-com-molho-em-uma-placa-de-madeira.jpg',
      resume: {
        title: 'Carne Bovina Grelhada',
        qtdFav: 124,
        text: 'Suculenta e marcante, a carne bovina grelhada realça o sabor natural da proteína com um toque defumado irresistível, perfeita para refeições completas e cheias de sabor.',
      },
      link: '#',
    },
    {
      bannerFoto:
        'assets/imagens/receita/delicioso-arranjo-de-doces-mexicanos (2).jpg',
      resume: {
        title: 'Pé de moleque',
        qtdFav: 98,
        text: 'Tradicional e irresistível, o pé de moleque traz a crocância do amendoim com o doce sabor do caramelo brasileiro.',
      },
      link: '#',
    },
    {
      bannerFoto:
        'assets/imagens/receita/cafe-expresso-quente-com-sementes-de-cafe-marrom-na-mesa-de-madeira-marrom.jpg',
      resume: {
        title: 'Cappuccino',
        qtdFav: 56,
        text: 'Cremoso e aromático, esse cappuccino combina café encorpado com espuma suave e um toque de chocolate.',
      },
      link: '#',
    },
    {
      bannerFoto:
        'assets/imagens/receita/um-prato-de-tacos-com-uma-pilha-de-tacos-ao-lado.jpg',
      resume: {
        title: 'Tortilha',
        qtdFav: 187,
        text: 'Uma deliciosa tortilha dourada, recheada com sabores típicos e perfeita para um lanche leve ou acompanhamento criativo.',
      },
      link: '#',
    },
    {
      bannerFoto:
        'assets/imagens/receita/arroz-con-leche-pudim-de-arroz-com-canela-em-uma-tigela-de-barro-em-marmore-branco-vista-superior.jpg',
      resume: {
        title: 'Canjica',
        qtdFav: 66,
        text: 'Cremoso e aromático, esse cappuccino combina café encorpado com espuma suave e um toque de chocolate.',
      },
      link: '#',
    },
  ];
}
