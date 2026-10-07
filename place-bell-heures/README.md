# Place Bell — heures travaillées, facturées et non facturées (2025-2026)

Reconstitution faite à partir de l'archive locale de courriels
`/Users/noctis/QC-Maintenance-Email-Backup` (9 boîtes ; 69 491 courriels pour 2025-2026,
26 095 pour 2026 ; couverture jusqu'au 7 août 2026). Aucun appel API : tout provient des
`.eml` bruts, de leurs pièces jointes Excel, et des PDF de factures et de feuilles de temps.

## 1. Le montage contractuel

QC Maintenance est **sous-traitant de GDI Services (Québec) SEC**. Dans le système de GDI,
Place Bell porte le code projet **`PBEL-01`** (bâtiment `31-25229-09`) ; Centre Bell porte
`CENB-01`. Le compte sous-traitant de QC est `QCMA-00`. C'est ce code projet qui permet de
séparer les deux sites, que la correspondance traite presque toujours ensemble.

Interlocuteurs GDI : Laura Brunet (heures et conciliation), Sylvain Thibodeau et Oriel McHugh
(exploitation), `sqc.soustraitants@gdi.com` (facturation).
Côté QC : Miler Salazar (dépôt des heures), Latifa Mezghiche (tenue des registres à partir de
sept. 2025), `pay@qcmaintenance.com`, David Salazar (VP opérations).

**Taux facturés à GDI** (lus sur les factures) : Ménage/Nettoyage **30,02 $/h** (32,00 $/h à
partir de mars 2026), Manutention **23,05 $/h**, Supervision **30,72 $/h**, plus une ligne de
surcharge de **0,30 $/h** à partir de mars 2026.

## 2. Les quatre sources, et laquelle fait foi

| Source | Contenu | Fiabilité |
|---|---|---|
| **Factures QC → GDI** (PDF) | lignes `PBEL-01` par classe de taux | **fait foi** pour les heures facturées |
| **Facturation GDI** `QCMA-00 <MOIS>.xlsx` | une ligne par employé/projet, colonnes 1..31 | fiable **jusqu'à févr. 2026** — voir piège ci-dessous |
| **Registre de site QC** `PLACE BELL - <MOIS> 2025.xlsx` | résumé `Jour du Mois / N. Heurs / Prix H / TOTAL` à 18 $/h + détail quotidien par employé | fiable, mais **s'arrête en déc. 2025** et **août 2025 manque** |
| **Feuilles de temps** (PDF numérisés) | `Registre de présence` Place Bell signé sur place | preuve terrain ; lecture visuelle uniquement |

> **Piège de calcul, à partir de mars 2026.** Les fichiers `QCMA-00` contiennent, en plus des
> lignes de main-d'œuvre, des lignes de **surcharge à 0,30 $/h qui répètent les mêmes heures**.
> Sommer naïvement les colonnes de jours double le total : avril 2026 donne 6 139 h alors que
> la facture porte 3 114,25 h de main-d'œuvre + 3 024,75 h de surcharge. Les chiffres de ce
> dossier sont ceux des **factures**.

## 3. Ce que disent les chiffres

- **Facturé à GDI pour Place Bell : 35 556,20 h = 992 581,73 $ avant taxes**
  (2025 : 23 455,95 h / 645 185,12 $ — 2026 janv.-juin : 12 100,25 h / 349 701,74 $ surcharge comprise).
- **Place Bell n'a jamais fait l'objet d'une facture distincte.** Il est fondu dans la facture
  mensuelle du portefeuille du VP Oriel McHugh (« Facture 2 OM »), avec Centre Bell et 6 autres
  sites — mais il y est **détaillé en lignes propres**, une par classe de taux. Seule exception :
  la facture #7766 (7 nov. 2025), frais de taxi Place Bell, 16 personnes × 60 $ = 960 $.
- **Heures non enregistrées réclamées formellement : 218,58 h, dont 208,08 h acceptées** par GDI
  (hiver-printemps 2025). GDI a refusé pour permis de travail expiré ou employé absent du système.
- **31,53 h supplémentaires jamais résolues** : 8,10 h du 13 juillet 2025 (jamais réclamées),
  4,00 h du 6 août 2025 (tracées comme non enregistrées dans le suivi de GDI), et 19,43 h du
  21 octobre 2025 (demande d'ajustement dont la réponse est introuvable).

## 4. Les deux trous du registre — et ce qu'ils cachent

**Août 2025 : aucun registre QC n'existe.** GDI a facturé 796,75 h, chiffre confirmé par cinq
extraits GDI indépendants, dont l'export du mois calendaire complet. La raison est visible dans
le courrier : pour le rapport du comité paritaire d'août, QC n'a pas construit son registre mais
a **demandé le détail à GDI** (fil « Demande des heures détaillées… », 4 sept. 2025). Les heures
tombent sur 7 journées seulement (6, 15, 16, 18, 25, 26, 27 août).

**Décembre 2025 : le registre s'arrête au 12.** Le ledger affiche 914,88 h, mais le relevé
consolidé que Latifa Mezghiche a produit ensuite (trois fichiers, jusqu'au 9 janvier 2026) donne
**2 513,85 h** pour le mois complet — dix journées n'avaient jamais été saisies. GDI a facturé
2 610,50 h, donc **l'écart a bien été facturé** : c'est le registre de QC qui était incomplet,
pas la facturation. C'est le dernier mois de la pratique.

## 5. 2026 : le registre de site disparaît

Après décembre 2025, plus aucun relevé Place Bell côté QC. Un balayage des 26 095 courriels de
2026 ne trouve aucune pièce jointe nommée « bell », aucun registre de présence Place Bell, aucune
feuille de temps QC pour le site. Deux causes : GDI devient le système d'enregistrement (QC valide
les exports hebdomadaires `Rapport FDT_Azur` au lieu de compter séparément, et depuis le
15 février 2026 tout pointage manuel exige une justification d'approbateur) ; et les fichiers de
Latifa migrent vers Google Drive (dossier « STADES », partagé le 20 avril 2026), hors de cette
archive. **En 2026, les heures Place Bell n'existent donc que dans la facturation.**

## 6. Le fil Ménagez-Vous — 32 heures, et le mandat qui part ailleurs

Le 13 mai 2026, David Salazar cote à Ménagez-Vous des taux spécifiques au projet Place Bell
(Nettoyage 30,72 $/h, Manutention 23,75 $/h), acceptés formellement le 14 mai. Une seule journée
de travail réel en découle : **32 h le 9 juillet 2026** (4 employés × 8 h, code MAN, Place Bell,
1950 rue Claude-Gagné), facturées `QCS56` à 24,00 $/h puis corrigées à 23,75 $/h par la note de
crédit `NC15` — net 760,00 $. C'est la **seule facture Place Bell émise à un tiers autre que GDI**
dans toute l'archive.

Le 7 août 2026, Johnatan Tenza écarte QC Maintenance du mandat. Le même jour, il transmet les
besoins de la semaine du 10 au 14 août à David Salazar à sa **nouvelle entreprise**
(`dsalazar@dssmultiservices.com`, « President – DSS Multiservices »), qui confirme. Ce travail
est postérieur à la fin de couverture de l'archive : aucune heure ne s'y rapporte ici.

## 7. Écart global, et comment le lire

Sur les 11 mois de 2025 où QC a tenu un relevé (tout sauf août), QC enregistre **23 588,60 h**
contre **22 659,20 h facturées** — soit **+929,40 h** consignées mais non facturées, environ
quatre fois ce que les réclamations formelles ont récupéré.

Trois réserves, à respecter avant d'en tirer une créance :

1. **Les périodes ne coïncident pas.** Le registre QC est calendaire ; GDI concilie du lundi au
   dimanche (p. ex. « 30 nov. – 3 janv. »). Un écart mensuel isolé peut n'être qu'un décalage de
   frontière, d'autant que les quarts sont de nuit et chevauchent minuit.
2. **Le 18 $/h du registre QC est une valeur interne**, pas le taux facturé. Les heures sont
   l'unité fiable ; pour convertir, utiliser les taux réels de la section 1.
3. **Une partie de l'écart est légitime** : GDI retranche les pauses repas et refuse les heures
   d'employés dont le permis est expiré ou qui ne sont pas au système. Le 13 juillet 2025 le
   montre en miniature — 8,10 h d'écart, réparties en 0,42 à 0,75 h par travailleur.

## 8. Vérification contre les feuilles de temps signées

Cinq PDF numérisés ont été lus page par page (40 pages au total, aucun échantillonnage) et
confrontés au registre. Sur **15 journées vérifiables** :

- **6 journées concordent exactement** (5, 6, 8, 13, 14 et 18 janvier 2025) ;
- **2 journées à moins d'une heure d'écart** (9 janvier : 1,00 h ; 16 avril : 0,67 h) ;
- **7 journées où le scan donne moins que le registre** — non pas une contradiction, mais un
  formulaire d'une seule équipe joint pour appuyer une réclamation précise, alors que la journée
  comptait plusieurs quarts (le 10 avril, le formulaire ne couvre que l'équipe manutention).

**Le registre de site est donc corroboré partout où une preuve existe.** Détail dans
`place-bell-verification-feuilles-scannees.csv`.

Note : `Feuilles de temps CENBELL et PBELL : decembre.pdf` (17 pages, mixte) est **de décembre
2024** et a été exclu du total ; sa part Place Bell est de 257,50 h.

## 9. Fichiers

**`documents/` — les 98 pièces originales (74 Mo), en local uniquement.** Extraites telles
quelles de l'archive et classées en six dossiers : registres de site, facturation GDI, factures,
feuilles de temps signées, heures non enregistrées, hors-GDI. `documents/LISEZ-MOI.md` explique
chaque dossier ; `documents/_index.csv` trace chaque pièce jusqu'à son courriel d'origine, avec
date, expéditeur et SHA-1.

> **Ce dossier n'est pas versionné** (`.gitignore`). Ce dépôt est public, et ces pièces
> contiennent des feuilles de temps signées à la main, les noms et codes de ~100 employés, leurs
> heures et taux, et des mentions de statut de permis de travail. C'est aussi la règle déjà
> suivie ailleurs dans ce dépôt : `comite-paritaire-archivo-real/` versionne les courriels mais
> pas leurs pièces jointes, qui restent dans `QC-Maintenance-Email-Backup/`.

Tableaux dérivés :

- `place-bell-heures-mensuel.csv` — mois par mois : heures enregistrées par QC, source, heures
  facturées, numéro de facture, montant avant taxes, écart.
- `place-bell-heures-non-enregistrees.csv` — chaque réclamation d'heures non enregistrées :
  montant réclamé, accepté, statut.
- `place-bell-hors-gdi.csv` — le travail Place Bell hors contrat GDI (Ménagez-Vous).
- `place-bell-verification-feuilles-scannees.csv` — confrontation journée par journée entre les
  feuilles de temps signées et le registre.
