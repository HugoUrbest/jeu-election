// Élection — interactions de la landing page : en-tête, apparitions, e-mail, plateau en grand, essai de Sortie en public.
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // En-tête : ombre dès que la page défile.
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Apparition des blocs au défilement.
  const blocs = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    blocs.forEach((bloc) => observer.observe(bloc));
  } else {
    blocs.forEach((bloc) => bloc.classList.add('is-visible'));
  }

  // Adresse e-mail assemblée dans le navigateur, pour limiter la collecte par les robots.
  const adresse = ['gervaishugo', 'yahoo.fr'].join('@');
  const messages = {
    testeur: {
      sujet: 'Élection — Je veux tester le prototype',
      corps: 'Bonjour Hugo,\n\nJe veux bien tester Élection.\n\nPrénom :\nVille :\nNombre de joueurs autour de la table :\n\nÀ bientôt !',
    },
    nouvelles: {
      sujet: 'Élection — Tenez-moi au courant',
      corps: 'Bonjour Hugo,\n\nJ’aimerais être prévenu(e) de la sortie d’Élection.\n\nÀ bientôt !',
    },
    contact: { sujet: 'Élection', corps: '' },
  };
  const mailto = ({ sujet, corps }) =>
    `mailto:${adresse}?subject=${encodeURIComponent(sujet)}${corps ? `&body=${encodeURIComponent(corps)}` : ''}`;
  document.querySelectorAll('[data-mail]').forEach((lien) => {
    lien.href = mailto(messages[lien.dataset.mail] ?? messages.contact);
  });
  document.querySelectorAll('[data-mail-text]').forEach((el) => {
    const lien = document.createElement('a');
    lien.href = mailto(messages.contact);
    lien.textContent = adresse;
    el.replaceChildren(lien);
  });

  // Plateau en grand : ajusté à l'écran, ou en taille réelle centré sur le point cliqué.
  const zoom = document.getElementById('zoom');
  const declencheur = document.querySelector('[data-zoom]');
  if (zoom && declencheur && typeof zoom.showModal === 'function') {
    const vue = zoom.querySelector('.zoom__vue');
    const image = vue.querySelector('img');
    const bascule = zoom.querySelector('[data-zoom-toggle]');
    const tailleReelle = (actif, point = { x: 0.5, y: 0.5 }) => {
      zoom.classList.toggle('is-reel', actif);
      bascule.textContent = actif ? 'Ajuster à l’écran' : 'Taille réelle';
      bascule.setAttribute('aria-pressed', String(actif));
      if (actif) {
        vue.scrollLeft = point.x * image.offsetWidth - vue.clientWidth / 2;
        vue.scrollTop = point.y * image.offsetHeight - vue.clientHeight / 2;
      }
    };
    declencheur.addEventListener('click', (event) => {
      event.preventDefault();
      if (!image.dataset.hd) {
        // Version déjà affichée dans la page tout de suite, haute définition dès qu'elle est chargée.
        image.dataset.hd = 'demandee';
        const hd = new Image();
        hd.onload = () => { image.src = hd.src; };
        hd.src = image.dataset.src;
      }
      tailleReelle(false);
      zoom.showModal();
    });
    image.addEventListener('click', (event) => {
      if (zoom.classList.contains('is-reel')) {
        tailleReelle(false);
        return;
      }
      // L'image est en object-fit: contain : on retrouve le carré réellement affiché.
      const cadre = image.getBoundingClientRect();
      const cote = Math.min(cadre.width, cadre.height);
      const borne = (v) => Math.min(1, Math.max(0, v));
      tailleReelle(true, {
        x: borne((event.clientX - cadre.left - (cadre.width - cote) / 2) / cote),
        y: borne((event.clientY - cadre.top - (cadre.height - cote) / 2) / cote),
      });
    });
    bascule.addEventListener('click', () => tailleReelle(!zoom.classList.contains('is-reel')));
    zoom.querySelector('[data-zoom-close]').addEventListener('click', () => zoom.close());
    zoom.addEventListener('click', (event) => {
      if (event.target === zoom) zoom.close();
    });
  }

  // Essai de Sortie en public : thème, dé, chrono de 30 secondes.
  const essai = document.querySelector('[data-essai]');
  if (!essai) return;

  const themes = [
    { emoji: '👴', titre: 'Les retraites', question: 'Quel âge de départ à la retraite défendez-vous et pourquoi ?' },
    { emoji: '🍞', titre: 'Le pouvoir d’achat', question: 'Que proposez-vous concrètement face à la hausse des prix ?' },
    { emoji: '⚡', titre: 'La politique énergétique', question: 'Nucléaire ou renouvelables : quelle est votre vision pour 2050 ?' },
  ];
  // Face du dé → camp à défendre, comme sur la carte de référence du jeu.
  const camps = {
    1: { nom: 'le Communiste', couleur: 'var(--communiste)' },
    2: { nom: 'le Socialo', couleur: 'var(--socialo)' },
    3: { nom: 'le Centriste', couleur: 'var(--centriste)' },
    4: { nom: 'l’Écolo', couleur: 'var(--ecolo)' },
    5: { nom: 'le Droitard', couleur: 'var(--droitard)' },
    6: { nom: 'le Patriote', couleur: 'var(--patriote)' },
  };
  const DUREE = 30000;

  const el = (selecteur) => essai.querySelector(selecteur);
  const theme = { emoji: el('[data-theme-emoji]'), titre: el('[data-theme-titre]'), question: el('[data-theme-question]') };
  const de = el('[data-de]');
  const camp = el('[data-camp]');
  const chrono = el('[data-chrono]');
  const secondes = el('[data-secondes]');
  const fin = el('[data-fin]');
  const boutonTheme = el('[data-action="theme"]');
  const boutonDe = el('[data-action="de"]');
  const boutonChrono = el('[data-action="chrono"]');
  let indexTheme = 0;
  let minuterie = null;

  const arreterChrono = () => {
    clearInterval(minuterie);
    minuterie = null;
    boutonChrono.textContent = 'Démarrer le chrono';
    chrono.classList.remove('is-urgent');
  };
  const remettreChrono = () => {
    arreterChrono();
    chrono.style.setProperty('--reste', '1');
    secondes.textContent = '30';
    fin.textContent = '30 secondes pour convaincre.';
  };

  boutonTheme.addEventListener('click', () => {
    indexTheme = (indexTheme + 1) % themes.length;
    const t = themes[indexTheme];
    theme.emoji.textContent = t.emoji;
    theme.titre.textContent = t.titre;
    theme.question.textContent = t.question;
  });

  boutonDe.addEventListener('click', () => {
    remettreChrono();
    boutonDe.disabled = true;
    boutonChrono.disabled = true;
    const face = 1 + Math.floor(Math.random() * 6);
    const afficher = () => {
      const c = camps[face];
      de.dataset.face = String(face);
      de.style.setProperty('--camp', c.couleur);
      const pastille = document.createElement('span');
      pastille.className = 'camp';
      pastille.style.setProperty('--p', c.couleur);
      pastille.innerHTML = '<svg aria-hidden="true"><use href="#i-pion"/></svg>';
      pastille.append(c.nom);
      camp.replaceChildren('Défendez ', pastille, ' pendant 30 secondes.');
      boutonDe.disabled = false;
      boutonChrono.disabled = false;
    };
    if (reduceMotion) {
      afficher();
      return;
    }
    de.classList.add('is-rolling');
    let tours = 0;
    const roulement = setInterval(() => {
      de.dataset.face = String(1 + Math.floor(Math.random() * 6));
      tours += 1;
      if (tours < 8) return;
      clearInterval(roulement);
      de.classList.remove('is-rolling');
      afficher();
    }, 75);
  });

  boutonChrono.addEventListener('click', () => {
    if (minuterie) {
      arreterChrono();
      fin.textContent = 'Chrono arrêté.';
      return;
    }
    const debut = Date.now();
    boutonChrono.textContent = 'Arrêter';
    fin.textContent = 'C’est parti, convainquez la tablée !';
    minuterie = setInterval(() => {
      const reste = Math.max(0, DUREE - (Date.now() - debut));
      secondes.textContent = String(Math.ceil(reste / 1000));
      chrono.style.setProperty('--reste', (reste / DUREE).toFixed(4));
      chrono.classList.toggle('is-urgent', reste <= 5000);
      if (reste > 0) return;
      arreterChrono();
      chrono.classList.add('is-urgent');
      fin.textContent = 'Temps écoulé ! Chaque adversaire vous note : 0 (pas convaincant), 1 (correct) ou 2 (excellent).';
    }, 100);
  });
})();
