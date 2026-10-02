// Cadre blanc centré utilisé par les pages de connexion et d'inscription.
//
// Disposition :      ┌──────────────────────┐
//                    │ Titre                │
//                    │ Sous-titre           │
//                    │ [formulaire]         │  <- children
//                    └──────────────────────┘

// Propriétés du composant
interface AuthCardProps {
  titre: string;
  sousTitre: string;
  children: React.ReactNode; // le formulaire affiché dans le cadre
}

export default function AuthCard({ titre, sousTitre, children }: AuthCardProps) {
  return (
    // justify-center : centre le cadre horizontalement ; py-14 : espace en haut et en bas
    <div className="container-page flex justify-center py-14">
      {/* max-w-md : largeur maximale de 448px, pleine largeur sur mobile */}
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold">{titre}</h1>
        <p className="mb-6 mt-1 text-muted">{sousTitre}</p>
        {children}
      </div>
    </div>
  );
}
