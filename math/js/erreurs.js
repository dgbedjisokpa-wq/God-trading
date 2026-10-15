// Erreur commune aux deux façons d'appeler l'IA (clé API ou compte claude.ai).
export class ErreurIA extends Error {
  constructor(message, { partiel = '', arret = false } = {}) {
    super(message);
    this.partiel = partiel;
    this.arret = arret;
  }
}
