'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    question: 'Combien de temps faut-il pour recevoir mon bijou ?',
    reponse:
      "Pour un bijou en stock, comptez 2 à 4 jours ouvrés pour l'expédition. Pour une pièce en fabrication sur commande, le délai (généralement 2 à 3 semaines) est indiqué sur la fiche produit.",
  },
  {
    question: 'Puis-je faire graver mon bijou ?',
    reponse:
      "Oui, la gravure est disponible sur de nombreuses pièces via notre formulaire Sur-mesure. Précisez le texte souhaité (initiales, date, mot doux) dans le champ dédié.",
  },
  {
    question: 'Comment connaître ma taille de bague ?',
    reponse:
      "Le plus simple est de mesurer le tour de doigt d'une bague que vous portez déjà à l'aide d'un mètre de couturière, ou de vous rendre chez un bijoutier pour un mesurage précis. N'hésitez pas à nous contacter si vous avez un doute, nous vous aiderons avec plaisir.",
  },
  {
    question: 'Les pierres sont-elles naturelles ?',
    reponse:
      'Oui, nous sélectionnons des pierres naturelles (perles, pierre de lune, quartz, topaze, saphir, émeraude, diamants) avec soin chez nos fournisseurs de confiance.',
  },
  {
    question: 'Puis-je retourner un bijou qui ne me convient pas ?',
    reponse:
      'Oui, vous disposez de 14 jours après réception pour un retour ou un échange, sauf pour les pièces personnalisées ou sur-mesure. Plus de détails sur notre page Livraison & Retours.',
  },
  {
    question: 'Comment entretenir mes bijoux Nabe ?',
    reponse:
      "Évitez le contact avec l'eau, les parfums et les produits cosmétiques. Rangez vos bijoux séparément dans leur écrin pour éviter les rayures, et nettoyez-les délicatement avec un chiffon doux et sec.",
  },
  {
    question: 'Proposez-vous des coffrets cadeaux ?',
    reponse:
      'Oui, nous proposons des coffrets cadeaux disponibles directement dans nos collections, parfaits pour offrir un bijou Nabe dans un écrin soigné.',
  },
  {
    question: 'Comment suivre ma commande ?',
    reponse:
      "Vous recevez un e-mail de confirmation dès la validation du paiement, puis un second e-mail avec le numéro de suivi dès l'expédition de votre colis.",
  },
];

export default function FaqAccordeon() {
  const [ouvertIndex, setOuvertIndex] = useState<number | null>(null);

  return (
    <div>
      {QUESTIONS.map((item: any, index: number) => (
        <div key={index} className="page-info__faq-item">
          <button
            className="page-info__faq-question"
            onClick={() => setOuvertIndex(ouvertIndex === index ? null : index)}
          >
            {item.question}
            <span className="page-info__faq-icone">{ouvertIndex === index ? '−' : '+'}</span>
          </button>
          {ouvertIndex === index && <p className="page-info__faq-reponse">{item.reponse}</p>}
        </div>
      ))}
    </div>
  );
}
