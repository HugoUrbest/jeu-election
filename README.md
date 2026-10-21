# Élection — landing page

Page de présentation du jeu de société satirique **Élection** (2 à 6 joueurs, 18+, ~45 min),
publiée avec GitHub Pages : https://hugourbest.github.io/jeu-election/

La campagne de financement participatif est sur Ulule : https://fr.ulule.com/jeu-de-societe-election/

## Contenu

- `docs/` : le site publié (HTML, CSS et JS sans étape de build).
  - `index.html` : tous les textes de la page.
  - `assets/css/style.css` : la charte (bleu nuit, or, crème, cocarde tricolore) et la mise en page.
  - `assets/js/main.js` : en-tête, apparitions, liens e-mail, plateau en grand, essai de Sortie en public.
  - `assets/img/` : images générées (ne pas modifier à la main).
  - `assets/fonts/` : Playfair Display, Barlow et Barlow Condensed (licence SIL Open Font License 1.1),
    servies par le site lui-même : aucun appel à Google, aucun cookie.
- `tools/` : génération des images.

## Mettre à jour les images

Les images sont produites à partir des fichiers de travail du jeu (PDF du plateau et visuels),
qui restent hors du dépôt pour ne pas publier toutes les cartes.

```bash
npm install
npm run images
```

Par défaut, le script lit `~/Desktop/Perso/jeu Election` ; la variable `JEU_ELECTION_SRC` permet
d'indiquer un autre dossier. Le rendu du plateau passe par PDFKit (macOS).

## Prévisualiser

```bash
npm run serve
```

puis ouvrir http://localhost:8295.

## Publier

GitHub Pages sert la branche `main`, dossier `/docs`. Un `git push` suffit pour mettre la page à jour.
