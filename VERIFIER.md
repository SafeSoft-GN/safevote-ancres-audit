# Vérifier une ancre

## 1. L'ancre a bien été publiée à cette date

Avec le client OpenTimestamps (`pip install opentimestamps-client`) :

```
ots verify anchors/2026/10/23/000001.json.ots
```

La commande indique depuis quand le fichier `000001.json` existe, d'après la blockchain Bitcoin. Juste après la publication, la preuve est « en attente » : elle se complète en quelques heures.

On peut aussi déposer le fichier `.json` et son `.ots` sur [opentimestamps.org](https://opentimestamps.org/).

## 2. Le journal d'audit correspond toujours à l'ancre

Cette vérification se fait sur la plateforme SafeVote, par un administrateur, en présence des personnes qui le souhaitent :

```sql
SELECT public.verify_audit_anchor(25901,
  'e7506e9397fe06ec473d46110d3638f2273787322f26df66049b6dd563559292');
```

La réponse contient :

- `correspond: true` : la ligne du journal à cette position a toujours cette empreinte. L'historique jusqu'à cette ancre n'a pas été réécrit.
- `correspond: false` : l'historique a été modifié après la publication de l'ancre.
- `chaine.intact: true` : toute la chaîne d'empreintes est cohérente, ligne par ligne.

## 3. Ce que l'on peut affirmer

Si les deux vérifications sont bonnes, tout ce qui a été inscrit au journal avant l'heure de l'ancre est resté tel quel depuis cette heure-là.
