pragma solidity ^0.5.7;
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
        bool admin;
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
        Fournisseur memory nouveauFournisseur;
        nouveauFournisseur.id = msg.sender;
        nouveauFournisseur.client = address(0); // client défini sur l'addresse 0
        nouveauFournisseur.nom = _nom;
        nouveauFournisseur.localisation = _localisation;
        nouveauFournisseur.TVA = _tva;
        nouveauFournisseur.admin = true;
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
        require(fournisseurs[_indexFournisseur[msg.sender]].admin == true || _existsFournisseur(msg.sender),"Vous n'êtes pas enregistré en tant que fournisseur");
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
    function _existsBon(uint _numBon) internal view returns (bool) {
        return bons[_indexBon[_numBon]].rang > 0;
    }
    
        /**
     * @dev Public function to check whether a supplier is active or not.
     * @param _fournisseur uint ID of the order to be minted
     * @return true or false
     */
    function _existsFournisseur(address _fournisseur) internal view returns (bool) {
        return fournisseurs[_indexFournisseur[_fournisseur]].id != address(0); // Marche pour tous les fournisseurs excepté celui au rang 0
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
        require(fournisseurs[_indexFournisseur[msg.sender]].admin == true,"Vous devez être le fournisseur en haut de chaîne");
        require(_existsFournisseur(to),"Veuillez enregistrer votre fournisseur d'abord");
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
        // fournisseurs[_indexFournisseur[to]].bonsDeCommande[0][fournisseurs[_indexFournisseur[to]].bonsDeCommande[0].length] = _numBon;
        // fournisseurs[_indexFournisseur[to]].bonsDeCommande[1][fournisseurs[_indexFournisseur[to]].bonsDeCommande[1].length] = _montant;
        
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
        //require(_indexFournisseur[_owner]!=0, "Ce fournisseur n'existe pas");
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
    // function _longueurCarnetDeCommande_2(address _holder) public view returns(uint){
    //     uint[][2] memory carnetDeCommande = listeDeCommandes(_holder);
    //     return carnetDeCommande.length; --> retourne 2
    // }

    

    
        /**
     * @dev Check whether the supplier detains the right order, at the right amount.
     * @param _holder address to query the check
     * @param _numBon order id
     * @param _montant order value
     * @return bool true or false
     */
    function checkIfHeld(address _holder, uint _numBon, uint _montant) public view returns (bool){
        uint[][2] memory carnetDeCommande = listeDeCommandes(_holder);
        bool check;
        for(uint i = 0; i < _longueurCarnetDeCommande(_holder); i++ ){
            if(carnetDeCommande[0][i] == _numBon && carnetDeCommande[1][i] >= _montant){
                check = true;
            }
        }
    return check;
    }
    
    
    function transfer(uint _numBon, uint _montant, address to) public view{
        require(fournisseurs[_indexFournisseur[msg.sender]].admin == true || _existsFournisseur(msg.sender),"Vous n'êtes pas enregistré en tant que fournisseur");
        require(_existsFournisseur(to), "Vous ne pouvez transférer les fonds qu'à un fournisseur déjà enregistré");
        require(checkIfHeld(to, _numBon, _montant), "Vous ne possédez pas de ce bon en quantité suffisant (ou alors ne possédez pas ce bon du tout");
        
    }
    
}


