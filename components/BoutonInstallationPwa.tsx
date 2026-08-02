'use client';

import { useEffect, useState } from 'react';

export default function BoutonInstallationPwa({ admin = false }: { admin?: boolean }) {
  const [installable, setInstallable] = useState(false);
  const [ios, setIos] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const dejaInstallee =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const appareilIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

    setIos(appareilIos);
    setInstallable(!dejaInstallee && (appareilIos || Boolean(window.__nabeInviteInstallation)));

    function rendreDisponible() {
      setInstallable(true);
    }
    window.addEventListener('nabe-pwa-installable', rendreDisponible);
    return () => window.removeEventListener('nabe-pwa-installable', rendreDisponible);
  }, []);

  async function installer() {
    if (ios) {
      setMessage("Sur iPhone : touchez Partager, puis Sur l'écran d'accueil et Ajouter.");
      return;
    }

    const invite = window.__nabeInviteInstallation;
    if (!invite) {
      setMessage("Ouvrez le menu du navigateur puis choisissez Installer l'application.");
      return;
    }

    await invite.prompt();
    const choix = await invite.userChoice;
    window.__nabeInviteInstallation = undefined;
    if (choix.outcome === 'accepted') setInstallable(false);
  }

  if (!installable && !message) return null;

  return (
    <div className={`pwa-installation${admin ? ' pwa-installation--admin' : ''}`}>
      {installable && (
        <button
          type="button"
          className={admin ? 'admin-sidebar__lien pwa-installation__bouton-admin' : 'pwa-installation__bouton'}
          onClick={installer}
        >
          Installer {admin ? 'Nabe Admin' : "l'application Nabe"}
        </button>
      )}
      {message && <p className="pwa-installation__message" role="status">{message}</p>}
    </div>
  );
}
