pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;


import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/utils/Address.sol";


contract bonDeCommande {
    using SafeMath for uint;
    using Address for address;

    
     struct Fournisseur {
        address id;
        address client;
        string nom;
        string localisation;
        uint[][2] bonsDeCommande;
        string TVA;
        bytes32 secret;
    }

    Fournisseur[] public fournisseurs;
    mapping(address => uint) _indexFournisseur;
    uint f = 0;
    
    // accounts to be activated
    mapping(bytes32 => uint) public _activation;

    // List of orders
    struct BonDeCommande {
        uint numBon;
        address[] proprietaires;
        uint montant;
        uint8 rang;
        string description;
        uint echeance;
        uint dateEmission;
    }

    BonDeCommande[] public bons;
    mapping(uint => uint) _indexBon;
    uint b = 0;
    
    
    constructor (string memory _nom, string memory _localisation, string memory _tva) public {

        //initialisations
        BonDeCommande memory genesisBon;
        genesisBon.description = "genesis";
        bons.push(genesisBon);
        _indexFournisseur[address(0)] = f;
        f++;
        Fournisseur memory genesisFournisseur;
        genesisFournisseur.nom = "genesis";
        fournisseurs.push(genesisFournisseur);
        _indexBon[0] = b;
        b++;
        
        Fournisseur memory nouveauFournisseur;
        nouveauFournisseur.id = msg.sender;
        nouveauFournisseur.client = address(0); // client défini sur l'addresse 0
        nouveauFournisseur.nom = _nom;
        nouveauFournisseur.localisation = _localisation;
        nouveauFournisseur.TVA = _tva;
        fournisseurs.push(nouveauFournisseur);
        _indexFournisseur[msg.sender] = f;
        f++;
    }


/**
     * @dev Public function to generate a new supplier account.
     * Only the bytes32 owner can activate the account, to be forwarded to the supplier.
     * @param _nom The supplier's name
     * @param _localisation The supplier's localisation
     * @param _TVA The supplier's tva unique number
     * @param _secret Secret code to be chosen by the client
     * @return secret
     */
    function creerCompteFournisseur(string memory _nom, string memory _localisation, string memory _TVA, string memory _secret) public returns(bytes32) {
        require(_existsFournisseur(msg.sender),"Vous n'êtes pas enregistré en tant que fournisseur");
        bytes32 secret = keccak256(abi.encodePacked(_secret));
        Fournisseur memory nouveauFournisseur;
        nouveauFournisseur.id = address(0);
        nouveauFournisseur.client = msg.sender;
        nouveauFournisseur.nom = _nom;
        nouveauFournisseur.localisation = _localisation;
        nouveauFournisseur.TVA = _TVA;
        nouveauFournisseur.secret = secret;
        fournisseurs.push(nouveauFournisseur);
        _indexFournisseur[msg.sender] = f;
        _activation[secret] = f;
        f++;
        
        return secret;
    }
    
    function debugSecret_NumBon(string memory debug) public pure returns(bytes32){
        return keccak256(abi.encodePacked(debug));
    }

    /**
     * @dev Public function to activate the supplier account.
     * Set the address to msg.sender
     * @param _secret The supplier's secret
     * @return The order provider
     */
    function activateAccount(bytes32 _secret) public returns (address){
        uint by = _activation[_secret];
        require( by >= 1, "Ce code n'existe pas ou a déjà été utilisé");
        fournisseurs[by].id = msg.sender;
        _activation[_secret] = 0;
        return fournisseurs[by].client;

    }
    
        /**
     * @dev Public function to check whether an order exists.
     * @param _numBon uint ID of the order to be minted
     * @return true or false
     */
    function _existsBon(uint _numBon) public view returns (bool) { //internal
        return bons[_indexBon[_numBon]].rang > 0;
    }
    
        /**
     * @dev Public function to check whether a supplier is active or not.
     * @param _fournisseur uint ID of the order to be minted
     * @return true or false
     */
    function _existsFournisseur(address _fournisseur) public view returns (bool) { //internal
        return fournisseurs[_indexFournisseur[_fournisseur]].id != address(0);
    }
    
        /**
     * @dev Public function to check whether a supplier is the one at the top of the supply chain or not.
     * @param _fournisseur uint ID of the order to be minted
     * @return true or false
     */
    function _isHigherSupplier(address _fournisseur) public view returns (bool) {
        return _indexFournisseur[_fournisseur] == 1;
    }
    
    /**
     * @dev Public function to mint a new order.
     * Reverts if the given purchase order ID already exists.
     * @param to The address that will own the minted order
     * @param _numBon uint ID of the order to be minted
     * @param _montant valeur du bon
     * @param _description description du bon
     * @param _echeance echeance du remboursement de la créance comptablement généré par le bon de commande
     */
     
    function _mint(address to, uint _numBon, uint _montant, string memory _description, uint _echeance) public {
        require(_isHigherSupplier(msg.sender),"Vous devez être le fournisseur en haut de chaîne");
        require(_existsFournisseur(to),"Veuillez enregistrer votre fournisseur d'abord");
        require(to != msg.sender, "Vous ne pouvez pas vous auto-attribuer un bon");
        require(!_existsBon(_numBon),"Ce numéro de bon existe déjà");

        //Création du bon de commande
        BonDeCommande memory nouveauBon;
        nouveauBon.numBon = _numBon;
        nouveauBon.proprietaires[0] = to;
        nouveauBon.montant = _montant;
        nouveauBon.rang = 1;
        nouveauBon.description = _description;
        nouveauBon.echeance = _echeance;
        nouveauBon.dateEmission = block.timestamp;
        bons.push(nouveauBon);
        _indexBon[_numBon] = b;
        b++;
        
        //Maj des infos fournisseur
        nouvelleCommande(to,_numBon, _montant);
    }
    
        /**
     * @dev Gets the list of suppliers.
     * @return Fournisseur
     */
    function listeFournisseur() public view returns (Fournisseur[] memory){
        return fournisseurs;
    }
    
        /**
     * @dev Gets the list of orders.
     * @return BonDeCommande
     */
    function listeBons() public view returns (BonDeCommande[] memory){
        return bons;
    }
    
        /**
     * @dev Gets the balance of the specified address.
     * https://ethereum.stackexchange.com/questions/49986/returning-dynamic-array-not-works
     * @return uint representing the amount owned by the passed address
     */
     
    function listeDeCommandes(address _owner) public view returns (uint[][2] memory) {
        require(_existsFournisseur(_owner), "Ce fournisseur n'existe pas");
    return fournisseurs[_indexFournisseur[_owner]].bonsDeCommande;
    }


        /**
     * @dev Gets the owner of the specified order number.
     * @param _numBon uint ID of the purchase order to query the owner of
     * @return address currently marked as the owner of the given purchase order ID
     */
    function listeDeDetenteur(uint _numBon) public view returns (address[] memory) {
        address[] memory owner = bons[_indexBon[_numBon]].proprietaires;
        return owner;
    }
    
        /**
     * @dev Gets longueur cdc.
     * @param _holder adresse
     * @return uint longueur
     */
    function _longueurCarnetDeCommande(address _holder) public view returns(uint){
        uint[][2] memory carnetDeCommande = listeDeCommandes(_holder);
        return carnetDeCommande[0].length;
    }

    //     return carnetDeCommande.length; --> retourne toujours 2
    
    
        /**
     * @dev Check whether the supplier detains the right order, at the right amount.
     * @param _holder address to query the check
     * @param _numBon order id
     * @return bool true or false
     */
    function checkIfHeldBon(address _holder, uint _numBon) public view returns (bool, uint){ //internal
        uint[][2] memory carnetDeCommande = listeDeCommandes(_holder);
        bool check;
        uint index = 0;
        for(uint i = 0; i < _longueurCarnetDeCommande(_holder); i++ ){
            if(carnetDeCommande[0][i] == _numBon){
                check = true;
                index = i;
            }
        }
    return (check,index) ;
    }

   /**
     * @dev Check whether the supplier detains the right order, at the right amount.
     * @param _holder address to query the check
     * @param _numBon order id
     * @param _montant order value
     * @return bool true or false
     */
    function checkIfHeldBonEtMontant(address _holder, uint _numBon, uint _montant) internal view returns (bool, uint){
        uint[][2] memory carnetDeCommande = listeDeCommandes(_holder);
        bool check;
        uint index = 0;
        for(uint i = 0; i < _longueurCarnetDeCommande(_holder); i++ ){
            if(carnetDeCommande[0][i] == _numBon && carnetDeCommande[1][i] >= _montant){
                check = true;
                index = i;
            }
        }
    return (check, index);
    }
    
        /**
     * @dev Create order in suppliers' book in case they did not have such an order before.
     * @param _numBon order
     * @param _montant montant
     * @param to address receiving
     */
    function nouvelleCommande(address to, uint _numBon, uint _montant) public{ //internal
        fournisseurs[_indexFournisseur[to]].bonsDeCommande[0].push(_numBon);
        fournisseurs[_indexFournisseur[to]].bonsDeCommande[1].push(_montant);
    }
    
    
     /**
     * @dev Delete order in suppliers' book in case they forwarded the whole order.
     * @param _index order index
     * @param from address sending
     */
    function supprimerCommande(address from, uint _index) public view{ //internal
        uint[][2] memory carnetDeCommande = listeDeCommandes(from);
        
        uint long = _longueurCarnetDeCommande(from);
        
        //n'intervient que dans le cas d'un transfert donc long != 0
        if (long == 1){
          delete carnetDeCommande[0][_index];
          delete carnetDeCommande[0][_index];
        }else{
        
        carnetDeCommande[0][_index] = carnetDeCommande[0][long-1];
        carnetDeCommande[1][_index] = carnetDeCommande[1][long-1];
        }
    }
    
    
       /**
     * @dev Check whether the supplier detains the right order, at the right amount.
     * @param _numBon order id
     * @param _montant order value
     * @param to address receiving
     * @param from address sending
     */
    function transfer(address to, address from, uint _index, uint _numBon, uint _montant) public{ //internal
        // Partie addition
        bool check;
        uint index;
        (check, index) = checkIfHeldBon(to, _numBon);
        if (check){                                     //cas de possesion du bon
            fournisseurs[_indexFournisseur[to]].bonsDeCommande[1][index] += _montant;
        
        }else{                                          //cas de non possession du bon
            nouvelleCommande(to,_numBon, _montant);
        }
        
        // Partie soustraction
        uint[][2] memory carnetDeCommande = listeDeCommandes(from);
        
        if(carnetDeCommande[1][index] == _montant){     //transfert de 100% du bon
            supprimerCommande(from, _index);
        }else{                                          //transfert d'une partie du bon
            carnetDeCommande[1][index] -= _montant;
        }
        
        
        
    }
        /**
     * @dev Check whether the supplier detains the right order, at the right amount.
     * @param to address receiving
     * @param _numBon order id
     * @param _montant order value
     */
    function pushBon(uint _numBon, uint _montant, address to) public{
        require(_existsFournisseur(msg.sender),"Vous n'êtes pas enregistré en tant que fournisseur");
        require(_existsFournisseur(to) && !_isHigherSupplier(to), "Vous ne pouvez transférer les fonds qu'à un fournisseur déjà enregistré");
        bool check;
        uint index;
        (check, index) = checkIfHeldBonEtMontant(msg.sender, _numBon, _montant);
        require(check, "Vous ne possédez pas de ce bon en quantité suffisant (ou alors ne possédez pas ce bon du tout"); 
        transfer(to, msg.sender, index, _numBon, _montant);
    }

    function pullBon(uint _numBon, uint _montant, address from) public{
        require(!_isHigherSupplier(msg.sender) || _existsFournisseur(msg.sender),"Vous n'êtes pas enregistré en tant que fournisseur");
        require(fournisseurs[_indexFournisseur[msg.sender]].client == from, "Vous ne pouvez vous faire parvenir des fonds qu'à votre client");
        bool check;
        uint index;
        (check, index) = checkIfHeldBonEtMontant(from, _numBon, _montant);
        require(check, "Votre client ne possède pas de ce bon en quantité suffisante (ou alors il ne possède pas ce bon du tout"); 
        transfer(msg.sender, from, index, _numBon, _montant);
    }

        /**
     * @dev Pay the receivable back.
     * @param _numBon order id
     */
    
    
    function burn(uint _numBon) public{
     }
    
}