// Barre de recherche des activités : champ texte + liste des types + bouton.
// Utilisée sur l'accueil et sur la page Activités.
//
// C'est un simple formulaire GET : en validant, le navigateur ouvre /activites?q=canoë&type=2.
// Avantages : fonctionne sans JavaScript, et l'adresse d'une recherche peut être partagée.

import type { TypeActivite } from "@/lib/types";

// Propriétés du composant
interface SearchBarProps {
  types: TypeActivite[]; // types proposés dans la liste déroulante
  recherche?: string; // texte déjà recherché (pour pré-remplir le champ)
  typeId?: number; // type déjà sélectionné
}

export default function SearchBar({ types, recherche = "", typeId }: SearchBarProps) {
  return (
    // action="/activites" : page qui affiche les résultats ; role="search" : aide les lecteurs d'écran
    // Sur mobile : éléments empilés (flex-col) ; à partir des tablettes : sur une ligne (sm:flex-row)
    <form action="/activites" className="card flex flex-col gap-2 p-2 sm:flex-row" role="search">
      {/* sr-only : libellé invisible à l'écran mais lu par les lecteurs d'écran */}
      <label htmlFor="q" className="sr-only">Rechercher une activité</label>
      <input
        id="q"
        name="q" // devient ?q=... dans l'URL
        type="search"
        defaultValue={recherche}
        placeholder="Rechercher une activité (ex : canoë)"
        className="input flex-1 border-transparent" // flex-1 : le champ prend toute la place restante
      />

      <label htmlFor="type" className="sr-only">Type d&apos;activité</label>
      <select id="type" name="type" defaultValue={typeId ?? ""} className="input sm:w-48">
        {/* Valeur vide = pas de filtre */}
        <option value="">Tous les types</option>
        {/* Une option par type */}
        {types.map((t) => (
          <option key={t.id} value={t.id}>{t.nom}</option>
        ))}
      </select>

      <button type="submit" className="btn btn-primary">Rechercher</button>
    </form>
  );
}
