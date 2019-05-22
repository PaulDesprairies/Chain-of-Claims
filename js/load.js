async function load() {
    const abi = [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "_numBon",
                    "type": "uint256"
                },
                {
                    "name": "_montant",
                    "type": "uint256"
                },
                {
                    "name": "_description",
                    "type": "string"
                },
                {
                    "name": "_emission",
                    "type": "uint256"
                },
                {
                    "name": "_echeance",
                    "type": "uint256"
                }
            ],
            "name": "_mint",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_secret",
                    "type": "bytes32"
                }
            ],
            "name": "activateAccount",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                },
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_tierZero",
                    "type": "address"
                },
                {
                    "name": "_tierOne",
                    "type": "address"
                }
            ],
            "name": "ajouterTierOne",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "from",
                    "type": "address"
                },
                {
                    "name": "_indexMontantFrom",
                    "type": "uint256"
                }
            ],
            "name": "burn",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_nom",
                    "type": "string"
                },
                {
                    "name": "_localisation",
                    "type": "string"
                },
                {
                    "name": "_tva",
                    "type": "string"
                },
                {
                    "name": "_mail",
                    "type": "string"
                },
                {
                    "name": "_secret",
                    "type": "string"
                }
            ],
            "name": "creerCompteFournisseur",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "_numBon",
                    "type": "uint256"
                },
                {
                    "name": "_montant",
                    "type": "uint256"
                }
            ],
            "name": "nouvelleCommande",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_montant",
                    "type": "uint256"
                }
            ],
            "name": "payback",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_numBon",
                    "type": "uint256"
                },
                {
                    "name": "_montant",
                    "type": "uint256"
                },
                {
                    "name": "from",
                    "type": "address"
                }
            ],
            "name": "pullBon",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_numBon",
                    "type": "uint256"
                },
                {
                    "name": "_montant",
                    "type": "uint256"
                },
                {
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "pushBon",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "from",
                    "type": "address"
                },
                {
                    "name": "_indexMontantFrom",
                    "type": "uint256"
                },
                {
                    "name": "_numBon",
                    "type": "uint256"
                },
                {
                    "name": "_montant",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "_numBon",
                    "type": "uint256"
                },
                {
                    "name": "_montant",
                    "type": "uint256"
                }
            ],
            "name": "transferAddition",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "name": "_nom",
                    "type": "string"
                },
                {
                    "name": "_localisation",
                    "type": "string"
                },
                {
                    "name": "_tva",
                    "type": "string"
                },
                {
                    "name": "_mail",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "secret",
                    "type": "bytes32"
                }
            ],
            "name": "Secret",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "secret",
                    "type": "bytes32"
                }
            ],
            "name": "Activate",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_numBon",
                    "type": "uint256"
                }
            ],
            "name": "NouveauBon",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_montant",
                    "type": "uint256"
                }
            ],
            "name": "PushBon",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_montant",
                    "type": "uint256"
                }
            ],
            "name": "payOff",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "_activation",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_numBon",
                    "type": "uint256"
                }
            ],
            "name": "_existsBon",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_fournisseur",
                    "type": "address"
                }
            ],
            "name": "_existsFournisseur",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_fournisseur",
                    "type": "address"
                }
            ],
            "name": "_isHigherSupplier",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_holder",
                    "type": "address"
                }
            ],
            "name": "_longueurCarnetDeCommande",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "bons",
            "outputs": [
                {
                    "name": "numBon",
                    "type": "uint256"
                },
                {
                    "name": "montant",
                    "type": "uint256"
                },
                {
                    "name": "description",
                    "type": "string"
                },
                {
                    "name": "dateEmission",
                    "type": "uint256"
                },
                {
                    "name": "echeance",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_numBon",
                    "type": "uint256"
                }
            ],
            "name": "bonsAttributes",
            "outputs": [
                {
                    "components": [
                        {
                            "name": "numBon",
                            "type": "uint256"
                        },
                        {
                            "name": "proprietaires",
                            "type": "address[]"
                        },
                        {
                            "name": "montant",
                            "type": "uint256"
                        },
                        {
                            "name": "description",
                            "type": "string"
                        },
                        {
                            "name": "dateEmission",
                            "type": "uint256"
                        },
                        {
                            "name": "echeance",
                            "type": "uint256"
                        }
                    ],
                    "name": "",
                    "type": "tuple"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_holder",
                    "type": "address"
                },
                {
                    "name": "_numBon",
                    "type": "uint256"
                }
            ],
            "name": "checkIfHeldBon",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                },
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_holder",
                    "type": "address"
                },
                {
                    "name": "_numBon",
                    "type": "uint256"
                },
                {
                    "name": "_montant",
                    "type": "uint256"
                }
            ],
            "name": "checkIfHeldBonEtMontant",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                },
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "fournisseurs",
            "outputs": [
                {
                    "name": "id",
                    "type": "address"
                },
                {
                    "name": "nom",
                    "type": "string"
                },
                {
                    "name": "localisation",
                    "type": "string"
                },
                {
                    "name": "tva",
                    "type": "string"
                },
                {
                    "name": "mail",
                    "type": "string"
                },
                {
                    "name": "client",
                    "type": "address"
                },
                {
                    "name": "rang",
                    "type": "uint8"
                },
                {
                    "name": "secret",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_fournisseur",
                    "type": "address"
                }
            ],
            "name": "fournisseursAttributes",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                },
                {
                    "components": [
                        {
                            "name": "id",
                            "type": "address"
                        },
                        {
                            "name": "nom",
                            "type": "string"
                        },
                        {
                            "name": "localisation",
                            "type": "string"
                        },
                        {
                            "name": "tva",
                            "type": "string"
                        },
                        {
                            "name": "mail",
                            "type": "string"
                        },
                        {
                            "name": "bonsDeCommande",
                            "type": "uint256[]"
                        },
                        {
                            "name": "montant",
                            "type": "uint256[]"
                        },
                        {
                            "name": "client",
                            "type": "address"
                        },
                        {
                            "name": "tierOne",
                            "type": "address[]"
                        },
                        {
                            "name": "rang",
                            "type": "uint8"
                        },
                        {
                            "name": "secret",
                            "type": "bytes32"
                        }
                    ],
                    "name": "",
                    "type": "tuple"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_numBon",
                    "type": "uint256"
                }
            ],
            "name": "listeBons",
            "outputs": [
                {
                    "components": [
                        {
                            "name": "numBon",
                            "type": "uint256"
                        },
                        {
                            "name": "proprietaires",
                            "type": "address[]"
                        },
                        {
                            "name": "montant",
                            "type": "uint256"
                        },
                        {
                            "name": "description",
                            "type": "string"
                        },
                        {
                            "name": "dateEmission",
                            "type": "uint256"
                        },
                        {
                            "name": "echeance",
                            "type": "uint256"
                        }
                    ],
                    "name": "",
                    "type": "tuple"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "listeBons",
            "outputs": [
                {
                    "components": [
                        {
                            "name": "numBon",
                            "type": "uint256"
                        },
                        {
                            "name": "proprietaires",
                            "type": "address[]"
                        },
                        {
                            "name": "montant",
                            "type": "uint256"
                        },
                        {
                            "name": "description",
                            "type": "string"
                        },
                        {
                            "name": "dateEmission",
                            "type": "uint256"
                        },
                        {
                            "name": "echeance",
                            "type": "uint256"
                        }
                    ],
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "name": "listeDeCommandes",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256[]"
                },
                {
                    "name": "",
                    "type": "uint256[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_numBon",
                    "type": "uint256"
                }
            ],
            "name": "listeDeDetenteurs",
            "outputs": [
                {
                    "name": "",
                    "type": "address[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_fournisseur",
                    "type": "address"
                }
            ],
            "name": "listeTierOne",
            "outputs": [
                {
                    "name": "",
                    "type": "address[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ]

    const addressContract = "0x528ed96fbe9d71d45eb68abd8399329a092dd37f" //Remix


    try {
        // Demande à MetaMask l'autorisation de se connecter
        const addresses = await ethereum.enable()
        const user = addresses[0]
        // Connection au noeud fourni par l'objet web3
        const provider = new ethers.providers.Web3Provider(ethereum);

        //instanciation du contrat
        let coc = new ethers.Contract(addressContract, abi, provider);

        //Signature
        coc = coc.connect(provider.getSigner(user.address));

        /// constitution de l'objet dapp
        dapp = {
            user,
            provider,
            coc,
        };
       
        console.log("dapp ok: ", await dapp);
        sessionStorage.setItem("dapp", dapp);

        //html
        dapp.coc.addressPromise.then(function(value) {
        });

        return dapp

    } catch (err) {
        // Gestion des erreurs
        console.error(err);
    }
  
}