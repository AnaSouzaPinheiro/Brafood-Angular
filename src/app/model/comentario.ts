export interface Comentario {
  id: number;
  id_receita: number;
  id_usuario: number;
  id_comentario_pai: number | null;
  nome_pai?: string;
  /** @ de quem foi respondido (único; o nome pode repetir) */
  apelido_pai?: string;
  id_usuario_pai?: number;
  texto: string;
  data_criacao: string;

  // dados extras (JOIN)
  nome_usuario: string;
  apelido_usuario?: string;
  foto_perfil?: string;
  nota?: number | null;
  /** Avaliação só com estrelas (sem texto): não é comentário, não recebe resposta */
  so_nota?: number | boolean;

  replies?: Comentario[];
}

export interface CriarComentarioPayload {
  id_usuario: number;
  id_receita: number;
  texto: string;
  id_comentario_pai?: number;
  nota?: number | null;
}