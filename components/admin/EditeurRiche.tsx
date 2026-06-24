'use client';

import { useRef, useEffect } from 'react';
import './editeur-riche.css';

const COULEURS = [
  { nom: 'Brun (texte)', valeur: '#3d2e1f' },
  { nom: 'Terracotta', valeur: '#a85c3f' },
  { nom: 'Or', valeur: '#b8923f' },
  { nom: 'Rouge', valeur: '#a8412a' },
  { nom: 'Vert', valeur: '#2e6b2e' },
  { nom: 'Noir', valeur: '#000000' },
];

export default function EditeurRiche({
  valeur,
  onChange,
  placeholder,
}: {
  valeur: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editeurRef = useRef<HTMLDivElement>(null);
  const premierRendu = useRef(true);

  useEffect(() => {
    if (premierRendu.current && editeurRef.current) {
      editeurRef.current.innerHTML = valeur || '';
      premierRendu.current = false;
    }
  }, [valeur]);

  function executerCommande(commande: string, valeurCommande?: string) {
    document.execCommand(commande, false, valeurCommande);
    editeurRef.current?.focus();
    gererSaisie();
  }

  function gererSaisie() {
    if (editeurRef.current) {
      onChange(editeurRef.current.innerHTML);
    }
  }

  function appliquerCouleur(couleur: string) {
    executerCommande('foreColor', couleur);
  }

  function inserrerLien() {
    const url = window.prompt('URL du lien :', 'https://');
    if (url) executerCommande('createLink', url);
  }

  return (
    <div className="editeur-riche">
      <div className="editeur-riche__barre">
        <button type="button" onClick={() => executerCommande('bold')} title="Gras">
          <strong>G</strong>
        </button>
        <button type="button" onClick={() => executerCommande('italic')} title="Italique">
          <em>I</em>
        </button>
        <button type="button" onClick={() => executerCommande('underline')} title="Souligné">
          <u>S</u>
        </button>
        <span className="editeur-riche__separateur" />
        <button type="button" onClick={() => executerCommande('insertUnorderedList')} title="Liste à puces">
          • Liste
        </button>
        <button type="button" onClick={inserrerLien} title="Insérer un lien">
          🔗 Lien
        </button>
        <span className="editeur-riche__separateur" />
        <div className="editeur-riche__couleurs">
          {COULEURS.map((c) => (
            <button
              key={c.valeur}
              type="button"
              className="editeur-riche__couleur"
              style={{ backgroundColor: c.valeur }}
              title={c.nom}
              onClick={() => appliquerCouleur(c.valeur)}
            />
          ))}
        </div>
        <span className="editeur-riche__separateur" />
        <button type="button" onClick={() => executerCommande('removeFormat')} title="Effacer la mise en forme">
          ✕ Format
        </button>
      </div>

      <div
        ref={editeurRef}
        className="editeur-riche__zone"
        contentEditable
        onInput={gererSaisie}
        onBlur={gererSaisie}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}
