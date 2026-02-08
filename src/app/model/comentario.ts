export interface Comentario {
  id: number;
  id_receita: number;
  id_usuario: number;
  id_comentario_pai: number | null;
  texto: string;
  data_criacao: string;

  // dados extras (JOIN)
  nome_usuario: string;
  foto_perfil?: string;

  replies?: Comentario[];
}

export interface CriarComentarioPayload {
  id_receita: number;
  texto: string;
  id_comentario_pai?: number;
}