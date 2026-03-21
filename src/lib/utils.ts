export const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const getYoutubeEmbedUrl = (url: string) => {
  let embedUrl = url;
  if (embedUrl.includes('watch?v=')) {
    const videoId = embedUrl.split('watch?v=')[1].split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (embedUrl.includes('youtu.be/')) {
    const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }
  return embedUrl;
};

export const normalizeString = (val: string) =>
  val.toLowerCase().trim().replace(/s$/, '');

export const categoryOrder = [
  'Associados',
  'Associado',
  'Ocorrências e Agenda',
  'Ocorrências E agenda',
  'Financeiro',
  'Orçamento',
  'Contábil',
  'Materiais',
  'Mala Direta',
  'Entrada/Saída',
  'Esportes',
  'Eventos',
  'Jurídico',
  'Administrativo',
  'Parâmetros',
  'SiclusNav',
  'Siclus Nav',
  'SiclusAcesso',
  'Siclus Acesso',
  'Catraca Control ID',
  'Catraca Topdata',
];

export const sortCategorias = (a: { nome: string }, b: { nome: string }) => {
  const indexA = categoryOrder.indexOf(a.nome);
  const indexB = categoryOrder.indexOf(b.nome);
  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  return a.nome.localeCompare(b.nome);
};
