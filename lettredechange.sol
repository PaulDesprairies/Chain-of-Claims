pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/utils/Address.sol";

contract bonDeCommande {
    using SafeMath for uint;
    using Address for address;
    
     struct Fournisseur {
        address id; //primary key
        string nom; //traceability infos
        string localisation;
        string tva;
        string mail;
        uint[] bonsDeCommande; //hold receivables.
        uint[] montant;
        address client; //supply chain
        address[] tierOne;
        uint8 rang;
        bytes32 secret; //activation code

    }

    Fournisseur[] public fournisseurs;
    mapping(address => uint) _indexFournisseur;
    uint f = 0;

    mapping(bytes32 => uint) public _activation; // accounts to be activated
 
    struct BonDeCommande {
        uint numBon; // Primary key
        address[] proprietaires; // Supply chain members tier
        uint montant; // Receivable description
        string description;
        uint dateEmission;
        uint echeance;
    }

    BonDeCommande[] public bons;
    mapping(uint => uint) _indexBon;
    uint b = 0;
    
    
    constructor (string memory _nom, string memory _localisation, string memory _tva, string memory _mail) public {
        //initialisations
        BonDeCommande memory genesisBon = BonDeCommande(0, new address[](0), 0, "Genesis", block.timestamp, 0);
        bons.push(genesisBon);
        _indexBon[0] = b;
        b++;
        
        Fournisseur memory genesisFournisseur = Fournisseur(address(0), "Genesis","","", "", new uint[](0), new uint[](0), address(0), new address[](0), 0, 0);
        fournisseurs.push(genesisFournisseur);
        fournisseurs[0].tierOne.push(msg.sender);
        _indexFournisseur[address(0)] = f;
        f++;
        
        Fournisseur memory premierFournisseur = Fournisseur(msg.sender, _nom, _localisation, _tva, _mail, new uint[](0), new uint[](0), address(0), new address[](0) , 0, 0);
        fournisseurs.push(premierFournisseur);
        _indexFournisseur[msg.sender] = f;
        f++;
    }

/**
     * @dev Public function to generate a new supplier account.
     * Only the bytes32 owner can activate the account, to be forwarded to the supplier.
     * @param _nom The supplier's name
     * @param _localisation The supplier's localisation
     * @param _tva The supplier's tva unique number
     * @param _secret Secret code to be chosen by the client
     * @return secret
     */
    function creerCompteFournisseur(string memory _nom, string memory _localisation, string memory _tva, string memory _mail, string memory _secret) public returns(bytes32) {
        require(_existsFournisseur(msg.sender),"Vous n'êtes pas enregistré en tant que fournisseur");
        bytes32 secret = keccak256(abi.encodePacked(_secret));
        require(_activation[secret] == 0, "Secret déjà en cours d'utilisation");
        uint8 rank = fournisseurs[_indexFournisseur[msg.sender]].rang + 1;
        Fournisseur memory nouveauFournisseur = Fournisseur(address(0), _nom, _localisation, _tva, _mail, new uint[](0), new uint[](0), msg.sender, new address[](0), rank, secret);
        fournisseurs.push(nouveauFournisseur);
        _activation[secret] = f;
        f++;
        emit Secret(secret);
    }
    
        event Secret(
            bytes32 indexed secret
            );
        


    /**
     * @dev Public function to activate the supplier account.
     * Set the address to msg.sender
     * @param _secret The supplier's secret
     * @return The order provider
     */
    function activateAccount(bytes32 _secret) public returns (address, address){
        uint by = _activation[_secret];
        require(by != _indexFournisseur[msg.sender], "Vous ne pouvez pas approver votre propre compte fournisseur");
        require(by >= 1, "Ce code n'existe pas ou a déjà été utilisé");
        fournisseurs[by].id = msg.sender;
        _indexFournisseur[msg.sender] = by;
        ajouterTierOne(fournisseurs[_indexFournisseur[msg.sender]].client,msg.sender);
        _activation[_secret] = 0;
        emit Activate(_secret);
        return (fournisseurs[by].client, msg.sender);
    }

        event Activate(
            bytes32 indexed secret
            );

    /**
     * @dev Public function to check whether an order exists.
     * @param _numBon uint ID of the order to be minted
     * @return true or false
     */
    function _existsBon(uint _numBon) public view returns (bool) { //internal
        return bons[_indexBon[_numBon]].montant > 0;
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
     * @dev Public function to check whether a supplier is the one at the top of the supply chain or not.
     * @param _tierZero adresse client
     * @param _tierOne adresse fournisseur
     */
    function ajouterTierOne(address _tierZero, address _tierOne)public {
        fournisseurs[_indexFournisseur[_tierZero]].tierOne.push(_tierOne);
    }
    
    /**
     * @dev Public function to mint a new order.
     * Reverts if the given purchase order ID already exists.
     * @param to The address that will own the minted order
     * @param _numBon uint ID of the order to be minted
     * @param _montant valeur du bon
     * @param _description description du bon
     * @param _emission date d'émission de la créance comptablement généré par le bon de commande
     * @param _echeance echeance du remboursement de la créance comptablement généré par le bon de commande
     */
     
    function _mint(address to, uint _numBon, uint _montant, string memory _description, uint _emission, uint _echeance) public payable {
        require(_isHigherSupplier(msg.sender),"Vous devez être le fournisseur en haut de chaîne");
        require(_existsFournisseur(to),"Veuillez enregistrer votre fournisseur d'abord ou lui laisser le temps de s'inscrire");
        require(to != msg.sender, "Vous ne pouvez pas vous auto-attribuer un bon");
        require(!_existsBon(_numBon),"Ce numéro de bon existe déjà");
        require(msg.value == _montant , "merci de garantir votre bon"); //* 1000000000


        //Création du bon de commande
        BonDeCommande memory nouveauBon;
        nouveauBon = BonDeCommande(_numBon, new address[](0), _montant, _description, _emission, _echeance);
        bons.push(nouveauBon);
        _indexBon[_numBon] = b;
        //bons[_indexBon[_numBon]].proprietaires.push(to); doublon
        b++;
        
        
        //Maj des infos fournisseur
        nouvelleCommande(to,_numBon, _montant);
        
        emit NouveauBon(_numBon);
    }
    
     event NouveauBon(
            uint indexed _numBon
            );
    
    /**
     * @dev Gets the list of suppliers tier-1 for one given supplier.
     * @param _fournisseur addresse
     * @return Fournisseur
     */
    function listeTierOne(address _fournisseur) public view returns (address[] memory){
        return fournisseurs[_indexFournisseur[_fournisseur]].tierOne;
    }
    
    /**
     * @dev Gets the list of supplier attributes.
     * @param _fournisseur addresse
     * @return Fournisseur
     */
    function fournisseursAttributes(address _fournisseur) public view returns (uint, Fournisseur memory){
        uint indexF = _indexFournisseur[_fournisseur];
        return (indexF, fournisseurs[indexF]);
    }
    
     /**
     * @dev Gets the list of orders attributes.
     * @param _numBon numbon
     * @return BonDeCommande
     */
    function bonsAttributes(uint _numBon) public view returns (BonDeCommande memory){
        return bons[_indexBon[_numBon]];
    }
    
    /**
     * @dev Gets the list of orders.
     * @return BonDeCommande
     */
    function listeBons() public view returns (BonDeCommande[] memory){
        return bons;
    }
    
        /**
     * @dev Gets the orders attributes.
     * @return BonDeCommande
     */
    function listeBons(uint _numBon) public view returns (BonDeCommande memory){
        return bons[_indexBon[_numBon]];
    }
    
    /**
     * @dev Gets the balance of the specified address.
     * https://ethereum.stackexchange.com/questions/49986/returning-dynamic-array-not-works
     * @return uint representing the amount owned by the passed address
     */
     
    function listeDeCommandes(address _owner) public view returns (uint[] memory, uint[] memory) {
        require(_existsFournisseur(_owner), "Ce fournisseur n'existe pas");
    return (fournisseurs[_indexFournisseur[_owner]].bonsDeCommande, fournisseurs[_indexFournisseur[_owner]].montant);
    }


    /**
     * @dev Gets the owner of the specified order number.
     * @param _numBon uint ID of the purchase order to query the owner of
     * @return address currently marked as the owner of the given purchase order ID
     */
    function listeDeDetenteurs(uint _numBon) public view returns (address[] memory) {
        require(_existsBon(_numBon), "Ce bon n'existe pas");
        address[] memory owner = bons[_indexBon[_numBon]].proprietaires;
        return owner;
    }
    
    /**
     * @dev Gets longueur cdc.
     * @param _holder adresse
     * @return uint longueur
     */
    function _longueurCarnetDeCommande(address _holder) public view returns(uint){
        return fournisseurs[_indexFournisseur[_holder]].bonsDeCommande.length;
    }

    //     return carnetDeCommande.length; --> retourne toujours 2
    
    
        /**
     * @dev Check whether the supplier detains the right order, at the right amount.
     * @param _holder address to query the check
     * @param _numBon order id
     * @return bool true or false
     */
    function checkIfHeldBon(address _holder, uint _numBon) public view returns (bool, uint){ //internal
        uint[] memory num;
        uint[] memory montant;
        (num, montant) = listeDeCommandes(_holder);
        bool check;
        uint index = 0;
        for(uint i = 0; i < _longueurCarnetDeCommande(_holder); i++ ){
            if(num[i] == _numBon){
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
    function checkIfHeldBonEtMontant(address _holder, uint _numBon, uint _montant) public view returns (bool, uint){
        uint[] memory num;
        uint[] memory montant;
        (num, montant) = listeDeCommandes(_holder);
        bool check;
        uint indexMontantFrom = 0;
        for(uint i = 0; i < _longueurCarnetDeCommande(_holder); i++ ){
            if(num[i] == _numBon && montant[i] >= _montant){
                check = true;
                indexMontantFrom = i;
            }
        }
    return (check, indexMontantFrom);
    }
    
        /**
     * @dev Create order in suppliers' book (part order) in case they did not have such an order before.
     * @param _numBon order
     * @param _montant montant
     * @param to address receiving
     */
    function nouvelleCommande(address to, uint _numBon, uint _montant) public{ //internal
        fournisseurs[_indexFournisseur[to]].bonsDeCommande.push(_numBon);
        fournisseurs[_indexFournisseur[to]].montant.push(_montant);
        bons[_indexBon[_numBon]].proprietaires.push(to);
    }
    
    
     /**
     * @dev Delete order in suppliers' book in case they forwarded the whole order.
     * @param _indexB order index
     * @param from address sending
     */
    function supprimerCommandeBon(address from, uint _indexB) public returns (uint){ //internal

        uint nbBons = _longueurCarnetDeCommande(from);
        uint montant = fournisseurs[_indexFournisseur[from]].montant[_indexB];
        
        if (nbBons - 1 != _indexB){
            fournisseurs[_indexFournisseur[from]].bonsDeCommande[_indexB] = fournisseurs[_indexFournisseur[from]].bonsDeCommande[nbBons - 1];
            fournisseurs[_indexFournisseur[from]].montant[_indexB] = fournisseurs[_indexFournisseur[from]].montant[nbBons - 1];
        }
        delete fournisseurs[_indexFournisseur[from]].bonsDeCommande[nbBons - 1];
        delete fournisseurs[_indexFournisseur[from]].montant[nbBons - 1];
        return montant;
    }
    
       /**
     * @dev Delete order in suppliers' book (part supplier) in case they forwarded the whole order.
     * @param from address sending
     * @param _numBon order id
     */
    function supprimerCommandeFournisseur(address from, uint _numBon) public{ //internal
        address[] memory detenteurs = listeDeDetenteurs(_numBon);
        uint nbDetenteurs = detenteurs.length;
        uint _indexF;
            
            for(uint i = 0; i < nbDetenteurs; i++){
                if(detenteurs[i] == from){
                    _indexF = i;
                }
            }
            
            if(nbDetenteurs - 1 != _indexF){
                bons[_indexBon[_numBon]].proprietaires[_indexF] = bons[_indexBon[_numBon]].proprietaires[nbDetenteurs-1];
            }
            
            delete bons[_indexBon[_numBon]].proprietaires[nbDetenteurs-1];
        }
        
       /**
     * @dev Delete order in suppliers' book in case they forwarded the whole order.
     * @param from address sending
     * @param _numBon order id
     */
        function supprimerCommande(address from, uint _indexB, uint _numBon) public returns(uint){ //internal
            uint montant = supprimerCommandeBon(from, _indexB);
            supprimerCommandeFournisseur(from, _numBon);
            return montant;
        }

    
    /**
     * @dev Transfer additinal part.
     * @param _numBon order id
     * @param _montant order value
     * @param to address receiving
     */
    function transferAddition(address to, uint _numBon, uint _montant) public{ //internal
        bool checkTo;
        uint indexTo;
        (checkTo, indexTo) = checkIfHeldBon(to, _numBon);
        if (checkTo){                                     //cas de possesion du bon
            fournisseurs[_indexFournisseur[to]].montant[indexTo] += _montant;
        
        }else{                                          //cas de non possession du bon
            nouvelleCommande(to,_numBon, _montant);
        }
    }

    /**
     * @dev Transfer soustraction part.
     * @param _montant order value
     * @param from address sending
     */
    function transferSoustraction(address from, uint _numBon, uint _indexMontantFrom, uint _montant) public { //internal

        if(fournisseurs[_indexFournisseur[from]].montant[_indexMontantFrom] == _montant){                 //transfert de 100% du bon
            supprimerCommande(from, _indexMontantFrom, _numBon);
        }else{                                                      //transfert d'une partie du bon
            fournisseurs[_indexFournisseur[from]].montant[_indexMontantFrom] -= _montant;
        }
    }

    /**
     * @dev Transfer an order from a supplier to another
     * @param _numBon order id
     * @param _montant order value
     * @param _indexMontantFrom index du bon de l'envoyeur
     * @param to address receiving
     * @param from address sending
     */
    function transfer(address to, address from, uint _indexMontantFrom, uint _numBon, uint _montant) public{ //internal
        transferAddition(to, _numBon, _montant);
        transferSoustraction(from, _numBon, _indexMontantFrom, _montant);

    }
    
     /**
     * @dev Reverse factoring.
     * @param to address receiving
     * @param _numBon order id
     * @param _montant order value
     */
    function pushBon(uint _numBon, uint _montant, address to) public{
        require(_existsFournisseur(msg.sender),"Vous n'êtes pas enregistré en tant que fournisseur");
        require(_existsFournisseur(to) && !_isHigherSupplier(to), "Vous ne pouvez transférer les fonds qu'à un fournisseur déjà enregistré");
        bool check;
        uint indexMontantFrom;
        (check, indexMontantFrom) = checkIfHeldBonEtMontant(msg.sender, _numBon, _montant);
        require(check, "Vous ne possédez pas de ce bon en quantité suffisant (ou alors ne possédez pas ce bon du tout"); 
        transfer(to, msg.sender, indexMontantFrom, _numBon, _montant);
        
       emit PushBon(_numBon);
    }
    
     event PushBon(
            uint indexed _montant
            );
    

     /**
     * @dev Classic factoring.
     * @param from address sending
     * @param _numBon order id
     * @param _montant order value
     */
    function pullBon(uint _numBon, uint _montant, address from) public{
        require(!_isHigherSupplier(msg.sender) || _existsFournisseur(msg.sender),"Vous n'êtes pas enregistré en tant que fournisseur");
        require(fournisseurs[_indexFournisseur[msg.sender]].client == from, "Vous ne pouvez vous faire parvenir des fonds qu'à votre client");
        bool check;
        uint indexMontantFrom;
        (check, indexMontantFrom) = checkIfHeldBonEtMontant(from, _numBon, _montant);
        require(check, "Votre client ne possède pas de ce bon en quantité suffisante (ou alors il ne possède pas ce bon du tout"); 
        transfer(msg.sender, from, indexMontantFrom, _numBon, _montant);
    }

        /**
     * @dev Check the order expiration.
     * @param _numBon order id
     */
    // function expiration(uint _numBon) public view returns(bool){
    //     uint _echeance = bons[_indexBon[_numBon]].echeance;
    //     return _echeance > block.timestamp;
    //  }
     
    /**
     * @dev Burn the token.
     * @param _numBon order id
     * @param from token holder
     * @param _indexB token position
     */
     function burn(address payable from, uint _indexB, uint _numBon) public payable{
        //  require(!expiration(_numBon), "Le bon sélectionné n'est pas arrivé à échéance");
             uint montant = supprimerCommande(from, _indexB, _numBon);
             payback(montant);
         
     }
     
     
    /**
     * @dev Trigger payback. //https://fiatcontract.com/#implement
     * @param _montant payable amount
     */
     function payback(uint _montant) public payable{
        msg.sender.transfer(_montant);
         emit payOff(_montant);
     }

    event payOff(
        uint indexed _montant
    );
}
