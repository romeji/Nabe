import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@nabe-bijoux.fr';
  const motDePasse = process.env.ADMIN_PASSWORD || 'changez-moi';

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: motDePasseHash,
      name: 'Admin Nabe',
    },
  });

  console.log(`✓ Compte admin créé/vérifié : ${admin.email}`);

  // Catégories de base
  const categories = [
    { nom: 'Bagues', slug: 'bagues', ordre: 1 },
    { nom: 'Colliers', slug: 'colliers', ordre: 2 },
    { nom: "Boucles d'oreilles", slug: 'boucles-doreilles', ordre: 3 },
    { nom: 'Bracelets', slug: 'bracelets', ordre: 4 },
    { nom: 'Pièces uniques', slug: 'pieces-uniques', ordre: 5 },
    { nom: 'Coffrets cadeaux', slug: 'coffrets-cadeaux', ordre: 6 },
  ];

  for (const cat of categories) {
    await prisma.categorie.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✓ ${categories.length} catégories créées/vérifiées`);

  // Témoignages de démonstration
  const temoignages = [
    { auteur: 'Claire D.', texte: "Des bijoux d'une finesse incroyable, on sent tout le savoir-faire et l'amour du détail.", note: 5, ordre: 1 },
    { auteur: 'Laura P.', texte: 'Un accompagnement personnalisé et des créations uniques.', note: 5, ordre: 2 },
    { auteur: 'Marie L.', texte: 'Nabe est pour moi une pépite, des bijoux que je ne quitte plus.', note: 5, ordre: 3 },
  ];

  for (const t of temoignages) {
    const existant = await prisma.temoignage.findFirst({ where: { auteur: t.auteur } });
    if (!existant) {
      await prisma.temoignage.create({ data: t });
    }
  }
  console.log(`✓ Témoignages de démonstration créés/vérifiés`);

  console.log('\n🎉 Seed terminé !');
  console.log(`\nConnectez-vous au backoffice avec :\n  Email : ${email}\n  Mot de passe : ${motDePasse}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
