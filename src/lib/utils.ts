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
