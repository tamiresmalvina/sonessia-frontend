import {
  AudioLines,
  Bird,
  CloudRain,
  Coffee,
  Fan,
  Flame,
  FlameKindling,
  Headphones,
  Library,
  Piano,
  TrainFront,
  Trees,
  Waves,
  Wind,
} from "lucide-react";

export const coresCategorias = {
  Natureza: "var(--cyan)",
  Instrumental: "var(--violet)",
  Ambiente: "var(--pink)",
  Ruídos: "var(--blue)",
};

export const sons = [
  { id: "chuva", nome: "Chuva", icone: CloudRain, categoria: "Natureza" },
  { id: "vento", nome: "Vento", icone: Wind, categoria: "Natureza" },
  { id: "ondas", nome: "Ondas", icone: Waves, categoria: "Natureza" },
  { id: "fogueira", nome: "Fogueira", icone: Flame, categoria: "Natureza" },
  { id: "passaros", nome: "Pássaros", icone: Bird, categoria: "Natureza" },
  { id: "cafeteria", nome: "Cafeteria", icone: Coffee, categoria: "Ambiente" },
  { id: "floresta", nome: "Floresta", icone: Trees, categoria: "Natureza" },
  {
    id: "branco",
    nome: "Ruído branco",
    icone: AudioLines,
    categoria: "Ruídos",
  },
  {
    id: "marrom",
    nome: "Ruído marrom",
    icone: AudioLines,
    categoria: "Ruídos",
  },
  { id: "rosa", nome: "Ruído rosa", icone: AudioLines, categoria: "Ruídos" },
  { id: "piano", nome: "Piano", icone: Piano, categoria: "Instrumental" },
  { id: "lofi", nome: "Lo-fi", icone: Headphones, categoria: "Instrumental" },
  {
    id: "biblioteca",
    nome: "Biblioteca",
    icone: Library,
    categoria: "Ambiente",
  },
  { id: "trem", nome: "Trem", icone: TrainFront, categoria: "Ambiente" },
  {
    id: "lareira",
    nome: "Lareira",
    icone: FlameKindling,
    categoria: "Ambiente",
  },
  { id: "ventilador", nome: "Ventilador", icone: Fan, categoria: "Ambiente" },
];

export const volumesIniciais = {
  chuva: 62,
  vento: 0,
  ondas: 34,
  fogueira: 0,
  passaros: 0,
  cafeteria: 0,
  floresta: 0,
  branco: 0,
  marrom: 18,
  rosa: 0,
  piano: 0,
  lofi: 0,
  biblioteca: 0,
  trem: 0,
  lareira: 0,
  ventilador: 0,
};

const imagemUnsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

export const ambientesProntos = [
  {
    id: "ruido-mascaramento",
    nome: "Ruído para mascaramento",
    categoria: "Mascaramento",
    sons: ["Ruído branco", "Ventilador"],
    imagem: imagemUnsplash("1688248018567-a9a857387e86"),
    descricaoImagem: "Trem em movimento desfocado",
  },
  {
    id: "biblioteca-silenciosa",
    nome: "Biblioteca silenciosa",
    categoria: "Foco",
    sons: ["Biblioteca", "Ruído marrom"],
    imagem: imagemUnsplash("1564981797816-1043664bf78d"),
    descricaoImagem: "Interior de biblioteca com janelas altas",
  },
  {
    id: "chuva-noturna",
    nome: "Chuva noturna",
    categoria: "Sono",
    sons: ["Chuva", "Vento"],
    imagem: imagemUnsplash("1630026405326-f6177eaf31a4"),
    descricaoImagem: "Rua chuvosa à noite",
  },
  {
    id: "mar-a-noite",
    nome: "Mar à noite",
    categoria: "Sono",
    sons: ["Ondas", "Vento"],
    imagem: imagemUnsplash("1535332371349-a5d229f49cb5"),
    descricaoImagem: "Mar sob a lua cheia",
  },
  {
    id: "floresta-tranquila",
    nome: "Floresta tranquila",
    categoria: "Relaxamento",
    sons: ["Floresta", "Pássaros", "Vento"],
    imagem: imagemUnsplash("1448375240586-882707db888b"),
    descricaoImagem: "Floresta com raios de sol",
  },
  {
    id: "chuva-leve",
    nome: "Chuva leve",
    categoria: "Relaxamento",
    sons: ["Chuva", "Pássaros"],
    imagem: imagemUnsplash("1718546837542-ed28109f3450"),
    descricaoImagem: "Plantas na janela durante a chuva",
  },
  {
    id: "cafeteria",
    nome: "Cafeteria",
    categoria: "Foco",
    sons: ["Cafeteria", "Lo-fi"],
    imagem: imagemUnsplash("1600093463592-8e36ae95ef56"),
    descricaoImagem: "Interior rústico de cafeteria",
  },
  {
    id: "lareira-aconchegante",
    nome: "Lareira aconchegante",
    categoria: "Relaxamento",
    sons: ["Lareira", "Piano"],
    imagem: imagemUnsplash("1631630259742-c0f0b17c6c10"),
    descricaoImagem: "Sala com fogão a lenha",
  },
  {
    id: "viagem-trem",
    nome: "Viagem de trem",
    categoria: "Mascaramento",
    sons: ["Trem", "Ruído rosa"],
    imagem: imagemUnsplash("1603270504031-4344a08b28b6"),
    descricaoImagem: "Vista de cachoeira pela janela do trem",
  },
];

const aliasesCategoriasApiParaMock = {
  Ruído: "Ruídos",
};

export function filtrarMockPorCategoria(itens, categoriaSelecionada) {
  if (categoriaSelecionada === "Todos") return itens;

  const categoriaMock = Object.hasOwn(aliasesCategoriasApiParaMock, categoriaSelecionada)
    ? aliasesCategoriasApiParaMock[categoriaSelecionada]
    : categoriaSelecionada;
  return itens.filter((item) => item.categoria === categoriaMock);
}
