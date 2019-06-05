# Chain-of-Claims
Interface permettant la traçabilité d'une chaîne d'approvisionnement par le financement de ses fournisseurs.

### Développement : ###
* Solidity
* Geth - Private blockchain
* Metamask
* ethers.js
* javascript
* IPFS
* Node.js

### Utilisation : ### 
Nécessite :
* Un ensemble d'adresses Metamask opérant sur le même réseau.
* Lancement via npx live-server

Un contrat est déployé pour chaque chaîne d'approvisionnement.
Le noeud déployeur est un grand compte réputé solvable, il renseigne ses informations dans le contructeurs du déployeur sur Remix.
Après avoir modifié le fichier load.js en y incluant la bonne adresse du contrat déployé avec laquelle interagir, le grand compte peut renseigner ses premiers fournisseurs en leur créant un compte à partir d'une clé secrète, clé dont chaque fournisseur aura besoin pour activer son propre compte. L'activation du compte est soumise à l'acceptation de différent document de garanties et d'un accord de non-divulgation.

Une fois les fournisseurs renseignés, il est possible de numériser vos bons de commandes et d'en faire profiter vos fournisseurs. Itération du processus et remboursement du bon de commande à échance au rang N.


