"use client";

import { useEffect, useMemo, useState } from "react";
import "./orbe.css";

type View = "overview" | "assets" | "budget" | "invest" | "goals" | "insights";
type Asset = { id: number; name: string; type: string; value: number; change: number; color: string };
type Transaction = { id: number; name: string; category: string; amount: number; date: string; icon: string };

const initialAssets: Asset[] = [
  { id: 1, name: "PEA • Boursorama", type: "Actions & ETF", value: 86420, change: 12.4, color: "#9cff57" },
  { id: 2, name: "Appartement • Lyon 2e", type: "Immobilier", value: 312000, change: 3.8, color: "#8d7cff" },
  { id: 3, name: "Ledger & Binance", type: "Crypto", value: 28450, change: 18.7, color: "#ffb84d" },
  { id: 4, name: "Assurance-vie", type: "Fonds & obligations", value: 61980, change: 5.2, color: "#50d7d0" },
  { id: 5, name: "Comptes courants", type: "Liquidités", value: 21840, change: 0.1, color: "#75a8ff" },
];

const transactions: Transaction[] = [
  { id: 1, name: "Salaire", category: "Revenus", amount: 4850, date: "Aujourd’hui", icon: "↗" },
  { id: 2, name: "Carrefour City", category: "Alimentation", amount: -64.2, date: "Aujourd’hui", icon: "⌁" },
  { id: 3, name: "Virement PEA", category: "Investissement", amount: -750, date: "Hier", icon: "◫" },
  { id: 4, name: "Free Mobile", category: "Abonnements", amount: -19.99, date: "Hier", icon: "◉" },
  { id: 5, name: "SNCF Connect", category: "Transport", amount: -89, date: "22 juil.", icon: "⇢" },
];

const nav: { id: View; label: string; icon: string }[] = [
  { id: "overview", label: "Vue d’ensemble", icon: "⌂" },
  { id: "assets", label: "Patrimoine", icon: "◇" },
  { id: "budget", label: "Budget", icon: "◒" },
  { id: "invest", label: "Investissements", icon: "↗" },
  { id: "goals", label: "Objectifs", icon: "◎" },
  { id: "insights", label: "Orbe AI", icon: "✦" },
];

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function OrbePage() {
  const [view, setView] = useState<View>("overview");
  const [period, setPeriod] = useState("1A");
  const [privacy, setPrivacy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<"account" | "upgrade" | null>(null);
  const [toast, setToast] = useState("");
  const [assets, setAssets] = useState(initialAssets);
  const [netMode, setNetMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("orbe-assets");
    if (saved) setAssets(JSON.parse(saved));
  }, []);

  const gross = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets]);
  const debt = 148900;
  const total = netMode ? gross - debt : gross;
  const hide = (value: string) => privacy ? "••••••" : value;

  function addAsset(form: FormData) {
    const next: Asset = {
      id: Date.now(),
      name: String(form.get("name") || "Nouvel actif"),
      type: String(form.get("type") || "Autre"),
      value: Number(form.get("value") || 0),
      change: 0,
      color: "#9cff57",
    };
    const updated = [...assets, next];
    setAssets(updated);
    localStorage.setItem("orbe-assets", JSON.stringify(updated));
    setModal(null);
    flash("Actif ajouté à votre patrimoine");
  }

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  return (
    <main className="orbe-shell">
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <button className="brand" onClick={() => setView("overview")} aria-label="Accueil Orbe">
          <span className="brand-mark"><i /><i /><i /></span><strong>orbe</strong>
        </button>
        <nav>
          <p className="nav-label">Espace personnel</p>
          {nav.map((item) => (
            <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => { setView(item.id); setMenu(false); }}>
              <span>{item.icon}</span>{item.label}{item.id === "insights" && <em>AI</em>}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="trial">
            <div><span>Essai Premium</span><b>12 jours</b></div>
            <div className="trial-bar"><i /></div>
            <button onClick={() => setModal("upgrade")}>Découvrir Premium <span>→</span></button>
          </div>
          <button className="profile">
            <span className="avatar">JM</span>
            <span><b>Jérôme Martin</b><small>Plan Gratuit</small></span>
            <span>•••</span>
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenu(!menu)}>☰</button>
          <div className="sync"><i /> Toutes vos données sont à jour <span>· il y a 2 min</span></div>
          <div className="top-actions">
            <button onClick={() => setPrivacy(!privacy)} title="Masquer les montants">{privacy ? "◉" : "◌"}</button>
            <button onClick={() => flash("Aucune nouvelle notification")}>♢<i className="notif" /></button>
            <button className="add-button" onClick={() => setModal("account")}><b>＋</b> Ajouter</button>
          </div>
        </header>

        <div className="content">
          {view === "overview" && <Overview total={total} gross={gross} debt={debt} privacy={privacy} hide={hide} period={period} setPeriod={setPeriod} netMode={netMode} setNetMode={setNetMode} setView={setView} assets={assets} upgrade={() => setModal("upgrade")} />}
          {view === "assets" && <Assets assets={assets} gross={gross} hide={hide} add={() => setModal("account")} />}
          {view === "budget" && <Budget hide={hide} />}
          {view === "invest" && <Investments hide={hide} upgrade={() => setModal("upgrade")} />}
          {view === "goals" && <Goals hide={hide} />}
          {view === "insights" && <Insights upgrade={() => setModal("upgrade")} />}
        </div>
      </section>

      {modal === "account" && <AddModal close={() => setModal(null)} add={addAsset} />}
      {modal === "upgrade" && <UpgradeModal close={() => setModal(null)} />}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}

function Overview({ total, gross, debt, hide, period, setPeriod, netMode, setNetMode, setView, assets, upgrade }: any) {
  return <>
    <div className="page-head">
      <div><p className="eyebrow">VENDREDI 24 JUILLET</p><h1>Bonjour Jérôme <span>👋</span></h1><p>Votre patrimoine progresse. Voici l’essentiel.</p></div>
      <button className="share">⇧ <span>Partager le bilan</span></button>
    </div>
    <div className="hero-grid">
      <article className="card wealth-card">
        <div className="card-title">
          <div><span>Patrimoine {netMode ? "net" : "brut"}</span><button onClick={() => setNetMode(!netMode)}>⌄</button></div>
          <div className="periods">{["1M","3M","1A","Tout"].map(p=><button key={p} className={period===p?"active":""} onClick={()=>setPeriod(p)}>{p}</button>)}</div>
        </div>
        <div className="wealth-value"><h2>{hide(fmt(total))}</h2><span>↗ +{hide("24 860 €")} <small>(+6,8 %)</small></span></div>
        <WealthChart />
        <div className="chart-legend"><span>24 juil. 2025</span><span>Aujourd’hui</span></div>
      </article>
      <article className="card pulse-card">
        <div className="card-title"><span>Votre pulse financier</span><button>•••</button></div>
        <div className="score-wrap">
          <div className="score-ring"><span><b>78</b><small>/100</small></span></div>
          <div><b>Très bon</b><p>Top 18 % des profils similaires</p></div>
        </div>
        <div className="score-lines">
          <Score label="Diversification" value={84} />
          <Score label="Épargne" value={72} />
          <Score label="Risque" value={77} />
        </div>
        <button className="text-link" onClick={upgrade}>Voir l’analyse complète <span>→</span></button>
      </article>
    </div>
    <div className="metric-grid">
      <Metric label="Patrimoine brut" value={hide(fmt(gross))} sub="↗ +3,6 % ce mois" tone="green" icon="◇" />
      <Metric label="Passif total" value={hide(fmt(debt))} sub="↘ −820 € ce mois" tone="blue" icon="⌁" />
      <Metric label="Revenus passifs" value={hide("1 284 € / mois")} sub="Objectif : 3 000 €" tone="purple" icon="↗" progress={43} />
      <Metric label="Taux d’épargne" value="31,4 %" sub="+4,2 pts vs. moyenne" tone="orange" icon="◎" progress={64} />
    </div>
    <div className="lower-grid">
      <article className="card allocation-card">
        <div className="card-title"><div><span>Allocation du patrimoine</span><small>Répartition par classe d’actif</small></div><button onClick={()=>setView("assets")}>Voir le détail →</button></div>
        <div className="allocation">
          <div className="donut" style={{"--real":"60deg"} as any}><div><b>{assets.length}</b><span>classes</span></div></div>
          <div className="asset-list">
            {assets.slice(0,5).map((a:any)=><div key={a.id}><span className="asset-dot" style={{background:a.color}}/><span>{a.type}</span><b>{hide(fmt(a.value))}</b><small>{Math.round(a.value/gross*100)} %</small></div>)}
          </div>
        </div>
      </article>
      <article className="card transactions-card">
        <div className="card-title"><div><span>Derniers mouvements</span><small>Juillet 2026</small></div><button onClick={()=>setView("budget")}>Tout voir →</button></div>
        <div className="transactions">{transactions.slice(0,4).map(t=><TransactionRow key={t.id} t={t} hide={hide} />)}</div>
      </article>
    </div>
    <div className="ai-banner">
      <div className="ai-icon">✦</div>
      <div><span>ORBE AI · NOUVELLE ANALYSE</span><h3>Vous pourriez économiser 2 140 € d’impôts cette année</h3><p>Votre allocation actuelle présente 3 opportunités d’optimisation simples.</p></div>
      <button onClick={()=>setView("insights")}>Découvrir l’analyse <span>→</span></button>
    </div>
  </>;
}

function Assets({ assets, gross, hide, add }: any) {
  return <><SectionHead eyebrow="PATRIMOINE" title="Tous vos actifs" copy="Une vision consolidée, claire et actualisée de ce que vous possédez." action="Ajouter un actif" onAction={add} />
    <div className="summary-strip"><div><span>Valeur totale</span><b>{hide(fmt(gross))}</b></div><div><span>Performance globale</span><b className="positive">+8,7 %</b></div><div><span>Revenus annuels</span><b>{hide("15 408 €")}</b></div><div><span>Dernière synchro</span><b>Il y a 2 min</b></div></div>
    <article className="card table-card"><div className="table-head"><span>Actif</span><span>Valeur</span><span>Performance</span><span>Poids</span></div>{assets.map((a:any)=><div className="asset-row" key={a.id}><div><i style={{background:a.color}}>{a.name[0]}</i><span><b>{a.name}</b><small>{a.type}</small></span></div><b>{hide(fmt(a.value))}</b><span className="positive">↗ +{a.change} %</span><span>{Math.round(a.value/gross*100)} %</span></div>)}</article>
  </>;
}

function Budget({ hide }: any) {
  return <><SectionHead eyebrow="CASHFLOW" title="Votre budget, sans effort" copy="Comprenez où part votre argent et arbitrez ce qui compte vraiment." />
    <div className="metric-grid budget-metrics"><Metric label="Revenus ce mois" value={hide("6 134 €")} sub="+8,2 % vs juin" tone="green" icon="↗"/><Metric label="Dépenses ce mois" value={hide("3 742 €")} sub="-4,1 % vs juin" tone="orange" icon="↘"/><Metric label="Épargne nette" value={hide("2 392 €")} sub="39 % des revenus" tone="purple" icon="◎"/><Metric label="Abonnements" value={hide("186 €")} sub="12 services actifs" tone="blue" icon="◉"/></div>
    <div className="lower-grid"><article className="card spend-card"><div className="card-title"><div><span>Dépenses par catégorie</span><small>Juillet 2026</small></div><button>Modifier les catégories</button></div><div className="bars">{[["Logement",1380,37],["Alimentation",612,16],["Transport",428,11],["Loisirs",386,10],["Abonnements",186,5]].map((x:any)=><div key={x[0]}><span>{x[0]}</span><div><i style={{width:x[2]*2.2+"%"}}/></div><b>{hide(fmt(x[1]))}</b></div>)}</div></article>
    <article className="card transactions-card"><div className="card-title"><div><span>Transactions récentes</span><small>Auto-catégorisées par Orbe</small></div><button>Filtrer</button></div><div className="transactions">{transactions.map(t=><TransactionRow key={t.id} t={t} hide={hide}/>)}</div></article></div>
  </>;
}

function Investments({ hide, upgrade }: any) {
  return <><SectionHead eyebrow="PORTEFEUILLE" title="Investissez avec conviction" copy="Performance, diversification, frais et risque enfin réunis au même endroit." />
    <div className="hero-grid"><article className="card wealth-card"><div className="card-title"><div><span>Performance du portefeuille</span><small>Comparée au MSCI World</small></div><span className="positive">+12,4 %</span></div><div className="wealth-value"><h2>{hide("176 850 €")}</h2><span>↗ +{hide("18 420 €")} sur 1 an</span></div><WealthChart /></article>
    <article className="card pulse-card"><div className="card-title"><span>Score portefeuille</span><button>•••</button></div><div className="score-wrap"><div className="score-ring purple"><span><b>82</b><small>/100</small></span></div><div><b>Solide</b><p>Risque bien maîtrisé</p></div></div><div className="score-lines"><Score label="Diversification" value={88}/><Score label="Frais" value={74}/><Score label="Rendement / risque" value={84}/></div><button className="text-link" onClick={upgrade}>Optimiser avec Orbe AI →</button></article></div>
    <article className="card table-card"><div className="card-title"><div><span>Positions principales</span><small>Hors liquidités</small></div><button>Exporter en CSV</button></div>{[["ETF MSCI World","CW8",42860,16.8],["ETF S&P 500","ESE",26450,13.2],["Bitcoin","BTC",18240,28.4],["LVMH","MC",11980,-2.7],["SCPI Iroko Zen","SCPI",28400,6.1]].map((a:any)=><div className="asset-row" key={a[0]}><div><i>{a[1][0]}</i><span><b>{a[0]}</b><small>{a[1]}</small></span></div><b>{hide(fmt(a[2]))}</b><span className={a[3]>0?"positive":"negative"}>{a[3]>0?"↗ +":"↘ "}{a[3]} %</span><button className="row-more">•••</button></div>)}</article>
  </>;
}

function Goals({ hide }: any) {
  return <><SectionHead eyebrow="PROJECTION" title="Donnez un cap à votre argent" copy="Transformez vos projets de vie en trajectoires financières actionnables." action="Nouvel objectif" />
    <div className="goals-grid">{[
      ["Liberté financière","Atteindre 3 000 € / mois","438 000 €","750 000 €",58,"Juin 2037","#9cff57"],
      ["Résidence secondaire","Apport pour une maison au Portugal","64 800 €","120 000 €",54,"Sept. 2029","#8d7cff"],
      ["Études de Léa","Capital études supérieures","18 400 €","45 000 €",41,"Août 2034","#ffb84d"]
    ].map((g:any)=><article className="card goal-card" key={g[0]}><div className="goal-top"><i style={{background:g[6]}}>◎</i><button>•••</button></div><span>{g[5]}</span><h3>{g[0]}</h3><p>{g[1]}</p><div className="goal-values"><b>{hide(g[2])}</b><span>sur {hide(g[3])}</span></div><div className="goal-progress"><i style={{width:g[4]+"%",background:g[6]}}/></div><small>{g[4]} % atteint · Trajectoire <strong>optimale</strong></small></article>)}</div>
    <div className="ai-banner goal-banner"><div className="ai-icon">⌁</div><div><span>SIMULATEUR</span><h3>Et si vous investissiez 200 € de plus chaque mois ?</h3><p>Vous pourriez atteindre votre liberté financière 2 ans et 4 mois plus tôt.</p></div><button>Simuler ce scénario →</button></div>
  </>;
}

function Insights({ upgrade }: any) {
  return <><SectionHead eyebrow="ORBE AI" title="Votre copilote patrimonial" copy="Des analyses personnalisées, explicables et directement actionnables." />
    <div className="insight-hero"><div><span className="spark">✦</span><p>ANALYSE HEBDOMADAIRE</p><h2>Votre argent peut travailler<br/>plus intelligemment.</h2><p>Orbe a analysé 127 points sur votre patrimoine et détecté 5 opportunités.</p></div><div className="orb-visual"><i/><i/><i/><span>✦</span></div></div>
    <div className="insight-list">{[
      ["Fiscalité","Optimisez vos versements sur le PER","Un versement de 6 200 € avant décembre pourrait réduire votre impôt jusqu’à 1 860 €.","Impact élevé","#9cff57"],
      ["Frais","Votre assurance-vie est plus chère que la moyenne","Vos frais annuels estimés sont de 1,42 %. Une alternative à 0,65 % économiserait 477 € par an.","477 € / an","#ffb84d"],
      ["Diversification","Votre exposition à la tech US dépasse votre cible","42 % de vos actifs financiers dépendent du secteur technologique américain.","Risque modéré","#8d7cff"]
    ].map((i:any)=><article className="card insight-row" key={i[0]}><i style={{background:i[4]}}>✦</i><div><span>{i[0]}</span><h3>{i[1]}</h3><p>{i[2]}</p></div><b>{i[3]}</b><button>→</button></article>)}</div>
    <div className="locked-analysis"><span>✦</span><div><b>2 analyses supplémentaires sont prêtes</b><p>Passez à Premium pour débloquer toutes vos recommandations.</p></div><button onClick={upgrade}>Débloquer avec Premium</button></div>
  </>;
}

function AddModal({ close, add }: { close:()=>void; add:(data:FormData)=>void }) {
  return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" onClick={close}>×</button><span className="modal-icon">＋</span><h2>Ajouter à mon patrimoine</h2><p>Connectez un établissement ou ajoutez un actif manuellement.</p>
    <div className="connect-grid"><button onClick={()=>alert("Connecteur bancaire prêt à recevoir vos clés Powens ou Bridge.")}><span>🏦</span><b>Compte bancaire</b><small>Synchronisation sécurisée</small></button><button><span>📈</span><b>Compte d’investissement</b><small>PEA, CTO, assurance-vie</small></button><button><span>₿</span><b>Crypto</b><small>Wallet ou exchange</small></button><button><span>⌂</span><b>Immobilier</b><small>Estimation et crédit</small></button></div>
    <div className="or-divider"><span>ou ajouter manuellement</span></div>
    <form action={add}><label>Nom de l’actif<input name="name" required placeholder="Ex. Livret A"/></label><div className="form-row"><label>Catégorie<select name="type"><option>Liquidités</option><option>Actions & ETF</option><option>Immobilier</option><option>Crypto</option><option>Fonds & obligations</option><option>Autre</option></select></label><label>Valeur actuelle<input name="value" required type="number" min="0" placeholder="10 000"/></label></div><button className="primary" type="submit">Ajouter cet actif</button></form>
  </div></div>;
}

function UpgradeModal({ close }: { close:()=>void }) {
  return <div className="modal-backdrop" onMouseDown={close}><div className="modal pricing-modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" onClick={close}>×</button><span className="modal-icon premium">✦</span><h2>Passez au niveau supérieur</h2><p>Commencez gratuitement, évoluez quand Orbe vous fait vraiment gagner plus.</p><div className="pricing">
    <div><span>GRATUIT</span><h3>0 €<small>/mois</small></h3><ul><li>✓ 3 comptes synchronisés</li><li>✓ Patrimoine & budget</li><li>✓ 1 objectif financier</li><li>✓ Saisie manuelle illimitée</li></ul><button onClick={close}>Votre forfait actuel</button></div>
    <div className="featured"><em>LE PLUS CHOISI</em><span>PREMIUM</span><h3>8,99 €<small>/mois</small></h3><p>Facturé 107,88 € / an</p><ul><li>✓ Comptes illimités</li><li>✓ Orbe AI & optimisations</li><li>✓ Projections avancées</li><li>✓ Mode famille & export fiscal</li><li>✓ Support prioritaire</li></ul><button onClick={()=>alert("Checkout Stripe à connecter avec STRIPE_SECRET_KEY.")}>Essayer 14 jours gratuitement</button></div>
  </div><small className="legal-note">Sans engagement · Annulation en 2 clics · Paiements sécurisés par Stripe</small></div></div>;
}

function SectionHead({eyebrow,title,copy,action,onAction}:any){return <div className="page-head"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div>{action&&<button className="add-button" onClick={onAction}><b>＋</b>{action}</button>}</div>}
function Score({label,value}:{label:string;value:number}){return <div><span>{label}</span><div><i style={{width:value+"%"}}/></div><b>{value}</b></div>}
function Metric({label,value,sub,tone,icon,progress}:any){return <article className="card metric"><div className={"metric-icon "+tone}>{icon}</div><div><span>{label}</span><h3>{value}</h3><p className={tone==="green"?"positive":""}>{sub}</p>{progress&&<div className="mini-progress"><i style={{width:progress+"%"}}/></div>}</div></article>}
function TransactionRow({t,hide}:{t:Transaction;hide:(v:string)=>string}){return <div className="transaction"><i>{t.icon}</i><span><b>{t.name}</b><small>{t.category} · {t.date}</small></span><b className={t.amount>0?"positive":""}>{t.amount>0?"+":""}{hide(fmt(t.amount))}</b></div>}
function WealthChart(){return <svg className="wealth-chart" viewBox="0 0 700 185" preserveAspectRatio="none" aria-label="Évolution du patrimoine"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9cff57" stopOpacity=".25"/><stop offset="1" stopColor="#9cff57" stopOpacity="0"/></linearGradient></defs><path className="gridline" d="M0 38H700M0 90H700M0 142H700"/><path className="area" d="M0 152 C40 145 62 151 92 133 S145 116 174 123 S220 103 255 110 S310 83 352 91 S408 69 446 77 S510 50 548 61 S610 32 700 18 L700 185 L0 185Z"/><path className="line" d="M0 152 C40 145 62 151 92 133 S145 116 174 123 S220 103 255 110 S310 83 352 91 S408 69 446 77 S510 50 548 61 S610 32 700 18"/><circle cx="700" cy="18" r="5"/></svg>}
