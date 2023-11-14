# Pré-requis

- Node: v18 ou plus
- npm: 8.7.0 ou plus (pas très important)
- scope pour le bot : `bot`, `applications.commands`
- permissions : `2147994688`


L'url du bot devrait ressembler à ça: 

`https://discord.com/api/oauth2/authorize?client_id=<CLIENT_ID>&permissions=2147994688&scope=bot%20applications.commands`


# Installation

Remplir le `.env` :

```
CLIENT_ID=<ID user du bot Discord>
CLIENT_TOKEN=<Token du bot discord>
AUTHOR_ID=<ID du user admin>
```

Le AUTHOR_ID est utilisé dans le cadre des commandes en MP ex: "/restart" pour forcer un redémarrage en MP du bot.


## Une fois rempli:


- Installation des librairies: `npm install`
- Ajouter le bot détenteur du token au serveur concerné
- Déployage des commandes du bot: `npm run deploy`
- Démarrage du bot: `npm run start`

## Une fois démarré :

- Sur le salon sur lequel on veut afficher le displatch faire : `/dispatch`


Afin de faire tourner le bot en permanance il est possible d'utiliser pm2

https://pm2.keymetrics.io/docs/usage/quick-start/
