# Pré-requis

- scope pour le bot : `bot`, `applications.commands`
- permissions : `2147994688`

L'url du bot devrait ressembler à ça: 

`https://discord.com/api/oauth2/authorize?client_id=<CLIENT_ID>&permissions=2147994688&scope=bot%20applications.commands`

### Installation [locale](#local)

- Node: v17.9.1

### Installation [avec Docker](#docker)

- Docker, version recommandée: 24.0.6 ou version stable

# <a name="local"></a>Installation Locale

Créer et remplir le `env.json` à la racine :

```
{
  "CLIENT_ID": "<ID user du bot Discord>",
  "CLIENT_TOKEN": "<Token du bot discord>",
  "AUTHOR_ID": "<ID du user admin>"
}
```

Le AUTHOR_ID est utilisé dans le cadre des commandes en MP ex: "/restart" pour forcer un redémarrage en MP du bot.


## Une fois rempli:


- Installation des librairies: `npm install`
- Ajouter le bot détenteur du token au serveur concerné
- Déployage des commandes du bot: `npm run deploy`
- Démarrage du bot: `npm run start`

Afin de faire tourner le bot en permanance il est possible d'utiliser pm2

https://pm2.keymetrics.io/docs/usage/quick-start/

# <a name="docker"></a>Installation via Docker

Créer et remplir le `env.json` à la racine :

```
{
  "CLIENT_ID": "<ID user du bot Discord>",
  "CLIENT_TOKEN": "<Token du bot discord>",
  "AUTHOR_ID": "<ID du user admin>"
}
```

Le AUTHOR_ID est utilisé dans le cadre des commandes en MP ex: "/restart" pour forcer un redémarrage en MP du bot.

Build : `docker build -t 21jc-caserne-docker .`

Run container : `docker run -it 21jc-caserne-docker`


## Une fois démarré :

- Sur le salon sur lequel on veut afficher le displatch faire : `/dispatch`