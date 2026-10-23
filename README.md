# SafeVote : ancres publiques du journal d'audit

Ce dépôt publie, chaque heure, l'**empreinte** du journal d'audit de la plateforme électorale **SafeVote** (SafeSoft Guinée). Il permet à toute personne (commission électorale, partis, observateurs, journalistes) de vérifier que l'historique des opérations n'a pas été réécrit après coup.

Il ne contient **aucun résultat**, aucune donnée personnelle et aucun secret : seulement des empreintes SHA-256.

## Comment ça marche

1. **Journal scellé.** Chaque action sur la plateforme (saisie, validation ou rejet d'un résultat, envoi d'un PV, affectation, changement de réglage…) est inscrite dans un journal d'audit. La base de données interdit d'y modifier ou d'y supprimer quoi que ce soit.
2. **Chaîne d'empreintes.** Chaque minute, les nouvelles lignes du journal sont scellées. Chaque ligne reçoit une empreinte SHA-256 calculée à partir de son contenu et de l'empreinte de la ligne précédente. Modifier, retirer ou intercaler une seule ligne change toutes les empreintes qui suivent.
3. **Ancre.** À chaque heure pile, la base relève la position de la dernière ligne scellée et son empreinte : c'est une **ancre**.
4. **Publication.** Quelques minutes plus tard, une tâche automatique de ce dépôt recopie la nouvelle ancre dans un fichier daté, et la fait horodater par [OpenTimestamps](https://opentimestamps.org/). Cet horodatage est ancré dans la blockchain Bitcoin : il prouve que l'empreinte existait à cette date, indépendamment de SafeSoft et de GitHub.

Résultat : même un administrateur de la base qui réécrirait le journal et recalculerait toute la chaîne obtiendrait des empreintes différentes de celles déjà publiées ici.

## Organisation du dépôt

```
anchors/
  AAAA/MM/JJ/            un dossier par jour (heure UTC)
    000001.json          une ancre : id, position, empreinte, releve_le
    000001.json.ots      sa preuve d'horodatage OpenTimestamps
latest.json              la dernière ancre publiée
scripts/fetch-anchors.mjs  la recopie des ancres depuis SafeVote
.github/workflows/anchors.yml  la tâche horaire
VERIFIER.md              comment vérifier une ancre
```

Exemple d'ancre :

```json
{
  "id": 1,
  "position": 25901,
  "empreinte": "e7506e9397fe06ec473d46110d3638f2273787322f26df66049b6dd563559292",
  "releve_le": "2026-10-23T18:30:35.770289+00:00"
}
```

## Vérifier

Voir [VERIFIER.md](VERIFIER.md).

## Règles du dépôt

- Les fichiers d'ancres ne sont jamais modifiés ni supprimés : chaque ancre est un nouveau fichier.
- Seule la tâche automatique écrit dans `anchors/` et `latest.json`.
- Toute personne peut cloner ce dépôt et en garder une copie : c'est encore mieux.
