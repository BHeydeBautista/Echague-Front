import type { SectionId } from "@/src/lib/scrollState";

export interface SectionCopy {
  index: string;
  label: string;
  kicker: string;
  headline: string;
  headlineItalic: string;
  body: string;
}

export const SECTION_COPY: Record<SectionId, SectionCopy> = {
  hero: {
    index: "00",
    label: "Origen",
    kicker: "Club Atlético Echagüe — Desde 1932",
    headline: "Un escudo,",
    headlineItalic: "una historia que pesa.",
    body: "Noventa años de pasión en Paraná, Entre Ríos. Esto no es un sitio web — es la puerta de entrada al club que somos.",
  },
  basketball: {
    index: "01",
    label: "Básquet",
    kicker: "01 — Básquet",
    headline: "Donde nace",
    headlineItalic: "la Liga Nacional.",
    body: "Desde la cancha de Echagüe, generaciones de jugadores llegaron a lo más alto del básquetbol argentino — y del mundo.",
  },
  swimming: {
    index: "02",
    label: "Natación",
    kicker: "02 — Natación",
    headline: "Cada largo,",
    headlineItalic: "una respiración distinta.",
    body: "Bajo la superficie, la disciplina se mide en silencio. Un club que forma cuerpos y carácter, brazada a brazada.",
  },
  volleyball: {
    index: "03",
    label: "Vóley",
    kicker: "03 — Vóley",
    headline: "El punto",
    headlineItalic: "se gana en el aire.",
    body: "Saque, bloqueo, remate. El vóley de Echagüe vive del instante suspendido antes de tocar el suelo.",
  },
  outro: {
    index: "04",
    label: "Futuro",
    kicker: "Echagüe — hoy y siempre",
    headline: "Este club",
    headlineItalic: "merece este futuro.",
    body: "Este es solo un concepto. La versión completa está por construirse — con la misma prestancia con la que se construyó esta historia.",
  },
};
