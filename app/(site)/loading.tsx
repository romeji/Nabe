import styles from './loading.module.css';

export default function ChargementSite() {
  return (
    <div className={styles.page} role="status" aria-label="Chargement de la page">
      <section className={styles.hero}>
        <div className={styles.heroTexte}>
          <span className={styles.ligneCourte} />
          <span className={styles.titre} />
          <span className={styles.texte} />
          <span className={styles.bouton} />
        </div>
      </section>
      <div className={styles.bandeau} />
      <section className={styles.section}>
        <span className={styles.ligneCourte} />
        <span className={styles.titreSection} />
        <div className={styles.cartes}>
          {[0, 1, 2, 3].map((index) => <span className={styles.carte} key={index} />)}
        </div>
      </section>
      <section className={styles.section}>
        <span className={styles.titreSection} />
        <div className={styles.produits}>
          {[0, 1, 2, 3].map((index) => <span className={styles.produit} key={index} />)}
        </div>
      </section>
      <span className={styles.accessible}>Chargement en cours…</span>
    </div>
  );
}
