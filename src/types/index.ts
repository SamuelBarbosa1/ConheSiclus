export interface Image {
  id: string;
  url: string;
}

export interface Video {
  id: string;
  url: string;
}

export interface RelatedSubmenu {
  id: string;
  nome: string;
}

export interface Submenu {
  id: string;
  nome: string;
  conteudo: string;
  grupo: string | null;
  categoriaId: string;
  images: Image[];
  videos: Video[];
  relatedSubmenus?: RelatedSubmenu[];
}

export interface Categoria {
  id: string;
  nome: string;
  icone: string | null;
  submenus: Submenu[];
}
