pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/utils/Address.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/drafts/Counters.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/introspection/ERC165.sol";

/**
 * @title ERC721 Non-Fungible Token Standard basic implementation (here as a purchase order)
 * @dev see https://eips.ethereum.org/EIPS/eip-721
 */
contract bonDeCommande is ERC165, IERC721 {
    using SafeMath for uint256;
    using Address for address;
    using Counters for Counters.Counter;

    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    // Mapping from purchase order ID to owner
    mapping (uint256 => address) private _detenteurBon;

    // Mapping from purchase order ID to approved address
    mapping (uint256 => address) private _approbationBon;

    // Mapping from owner to number of owned purchase order
    mapping (address => Counters.Counter) private _bonsDetenus;

    // Mapping from owner to operator approvals
    mapping (address => mapping (address => bool)) private _operatorApprovals;

    // List of suppliers
    struct Fournisseur {
        address id;
        address client;
        string nom;
        string localisation;
        uint[] bonsDeCommande;
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
    }

    BonDeCommande[] public bons;
    mapping(uint => uint) _indexBon;
    uint b = 0;


    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
    /*
     * 0x80ac58cd ===
     *     bytes4(keccak256('balanceOf(address)')) ^
     *     bytes4(keccak256('ownerOf(uint256)')) ^
     *     bytes4(keccak256('approve(address,uint256)')) ^
     *     bytes4(keccak256('getApproved(uint256)')) ^
     *     bytes4(keccak256('setApprovalForAll(address,bool)')) ^
     *     bytes4(keccak256('isApprovedForAll(address,address)')) ^
     *     bytes4(keccak256('transferFrom(address,address,uint256)')) ^
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256)')) ^
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)'))
     */

    constructor (string memory _nom, string memory _localisation, string memory _tva) public {
        // register the supported interfaces to conform to ERC721 via ERC165
        _registerInterface(_INTERFACE_ID_ERC721);
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
    
    function debugSecret(string memory debug) public pure returns(bytes32){
        return keccak256(abi.encodePacked(debug));
    }

    /**
     * @dev Public function to activate the supplier account.
     * Set the address to msg.sender
     * @param _secret The supplier's secret
     * @return The order provider
     */
    function activateAccount(bytes32 _secret) public returns (address){
        uint i = _activation[_secret];
        require( i >= 1, "Ce code n'existe pas ou a déjà été utilisé");
        fournisseurs[i].id = msg.sender;
        _activation[_secret] = 0;
        return fournisseurs[i].client;

    }

    /**
     * @dev Public function to mint a new order.
     * Reverts if the given purchase order ID already exists.
     * @param to The address that will own the minted order
     * @param _numBon uint256 ID of the order to be minted
     * @param _montant valeur du bon
     * @param _description description du bon
     */
    function _mint(address to, uint256 _numBon, uint256 _montant, string memory _description) public {
        require(to != address(0),"Vous ne pouvez transférer ce bon à une adresse vide");
        require(_indexFournisseur[to] >= 1,"Veuillez enregistrer votre fournisseur d'abord");
        require(!_exists(_numBon),"Ce numéro de bon existe déjà");
        _detenteurBon[_numBon] = to;
        _bonsDetenus[to].increment();

        BonDeCommande memory nouveauBon;
        nouveauBon.numBon = _numBon;
        nouveauBon.proprietaires[0] = msg.sender;
        nouveauBon.montant = _montant;
        nouveauBon.rang = 1;
        nouveauBon.description = _description;
        bons.push(nouveauBon);
        _indexBon[_numBon] = b;
        b++;

        emit Transfer(address(0), to, _numBon);
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
     * @param owner address to query the balance of
     * @return uint256 representing the amount owned by the passed address
     */
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0));
        return _bonsDetenus[owner].current();
    }

    /**
     * @dev Gets the owner of the specified order number.
     * @param numBon uint256 ID of the purchase order to query the owner of
     * @return address currently marked as the owner of the given purchase order ID
     */
    function ownerOf(uint256 numBon) public view returns (address) {
        address owner = _detenteurBon[numBon];
        require(owner != address(0));
        return owner;
    }

    /**
     * @dev Approves another address to transfer the given purchase order ID
     * The zero address indicates there is no approved address.
     * There can only be one approved address per purchase order at a given time.
     * Can only be called by the purchase order owner or an approved operator.
     * @param to address to be approved for the given purchase order ID
     * @param numBon uint256 ID of the purchase order to be approved
     */
    function approve(address to, uint256 numBon) public {
        address owner = ownerOf(numBon);
        require(to != owner);
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

        _approbationBon[numBon] = to;
        emit Approval(owner, to, numBon);
    }

    /**
     * @dev Gets the approved address for a purchase order ID, or zero if no address set
     * Reverts if the purchase order ID does not exist.
     * @param numBon uint256 ID of the purchase order to query the approval of
     * @return address currently approved for the given purchase order ID
     */
    function getApproved(uint256 numBon) public view returns (address) {
        require(_exists(numBon));
        return _approbationBon[numBon];
    }

    /**
     * @dev Sets or unsets the approval of a given operator
     * An operator is allowed to transfer all purchase orders of the sender on their behalf.
     * @param to operator address to set the approval
     * @param approved representing the status of the approval to be set
     */
    function setApprovalForAll(address to, bool approved) public {
        require(to != msg.sender);
        _operatorApprovals[msg.sender][to] = approved;
        emit ApprovalForAll(msg.sender, to, approved);
    }

    /**
     * @dev Tells whether an operator is approved by a given owner.
     * @param owner owner address which you want to query the approval of
     * @param operator operator address which you want to query the approval of
     * @return bool whether the given operator is approved by the given owner
     */
    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev Transfers the ownership of a given purchase order ID to another address.
     * Usage of this method is discouraged, use `safeTransferFrom` whenever possible.
     * Requires the msg.sender to be the owner, approved, or operator.
     * @param from current owner of the purchase order
     * @param to address to receive the ownership of the given purchase order ID
     * @param numBon uint256 ID of the purchase order to be transferred
     */
    function transferFrom(address from, address to, uint256 numBon) public {
        require(_isApprovedOrOwner(msg.sender, numBon));

        _transferFrom(from, to, numBon);
    }

    /**
     * @dev Safely transfers the ownership of a given purchase order ID to another address
     * If the target address is a contract, it must implement `onERC721Received`,
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     * @param from current owner of the purchase order
     * @param to address to receive the ownership of the given purchase order ID
     * @param numBon uint256 ID of the purchase order to be transferred
     */
    function safeTransferFrom(address from, address to, uint256 numBon) public {
        safeTransferFrom(from, to, numBon, "");
    }

    /**
     * @dev Safely transfers the ownership of a given purchase order ID to another address
     * If the target address is a contract, it must implement `onERC721Received`,
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     * @param from current owner of the purchase order
     * @param to address to receive the ownership of the given purchase order ID
     * @param numBon uint256 ID of the purchase order to be transferred
     * @param _data bytes data to send along with a safe transfer check
     */
    function safeTransferFrom(address from, address to, uint256 numBon, bytes memory _data) public {
        transferFrom(from, to, numBon);
        require(_checkOnERC721Received(from, to, numBon, _data));
    }

    /**
     * @dev Returns whether the specified purchase order exists.
     * @param numBon uint256 ID of the purchase order to query the existence of
     * @return bool whether the purchase order exists
     */
    function _exists(uint256 numBon) internal view returns (bool) {
        address owner = _detenteurBon[numBon];
        return owner != address(0);
    }

    /**
     * @dev Returns whether the given spender can transfer a given purchase order ID.
     * @param spender address of the spender to query
     * @param numBon uint256 ID of the purchase order to be transferred
     * @return bool whether the msg.sender is approved for the given purchase order ID,
     * is an operator of the owner, or is the owner of the purchase order
     */
    function _isApprovedOrOwner(address spender, uint256 numBon) internal view returns (bool) {
        address owner = ownerOf(numBon);
        return (spender == owner || getApproved(numBon) == spender || isApprovedForAll(owner, spender));
    }


    /**
     * @dev Internal function to burn a specific purchase order.
     * Reverts if the purchase order does not exist.
     * Deprecated, use _burn(uint256) instead.
     * @param owner owner of the purchase order to burn
     * @param numBon uint256 ID of the purchase order being burned
     */
    function _burn(address owner, uint256 numBon) internal {
        require(ownerOf(numBon) == owner);

        _clearApproval(numBon);

        _bonsDetenus[owner].decrement();
        _detenteurBon[numBon] = address(0);

        emit Transfer(owner, address(0), numBon);
    }

    /**
     * @dev Internal function to burn a specific purchase order.
     * Reverts if the purchase order does not exist.
     * @param numBon uint256 ID of the purchase order being burned
     */
    function _burn(uint256 numBon) internal {
        _burn(ownerOf(numBon), numBon);
    }

    /**
     * @dev Internal function to transfer ownership of a given purchase order ID to another address.
     * As opposed to transferFrom, this imposes no restrictions on msg.sender.
     * @param from current owner of the purchase order
     * @param to address to receive the ownership of the given purchase order ID
     * @param numBon uint256 ID of the purchase order to be transferred
     */
    function _transferFrom(address from, address to, uint256 numBon) internal {
        require(ownerOf(numBon) == from);
        require(to != address(0));

        _clearApproval(numBon);

        _bonsDetenus[from].decrement();
        _bonsDetenus[to].increment();

        _detenteurBon[numBon] = to;

        emit Transfer(from, to, numBon);
    }

    /**
     * @dev Internal function to invoke `onERC721Received` on a target address.
     * The call is not executed if the target address is not a contract.
     * @param from address representing the previous owner of the given purchase order ID
     * @param to target address that will receive the purchase orders
     * @param numBon uint256 ID of the purchase order to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(address from, address to, uint256 numBon, bytes memory _data)
        internal returns (bool)
    {
        if (!to.isContract()) {
            return true;
        }

        bytes4 retval = IERC721Receiver(to).onERC721Received(msg.sender, from, numBon, _data);
        return (retval == _ERC721_RECEIVED);
    }

    /**
     * @dev Private function to clear current approval of a given purchase order ID.
     * @param numBon uint256 ID of the purchase order to be transferred
     */
    function _clearApproval(uint256 numBon) private {
        if (_approbationBon[numBon] != address(0)) {
            _approbationBon[numBon] = address(0);
        }
    }
}
    pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/utils/Address.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/drafts/Counters.sol";
import "github.com/OpenZeppelin/openzeppelin-solidity/contracts/introspection/ERC165.sol";

/**
 * @title ERC721 Non-Fungible Token Standard basic implementation (here as a purchase order)
 * @dev see https://eips.ethereum.org/EIPS/eip-721
 */
contract bonDeCommande is ERC165, IERC721 {
    using SafeMath for uint256;
    using Address for address;
    using Counters for Counters.Counter;

    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    // Mapping from purchase order ID to owner
    mapping (uint256 => address) private _detenteurBon;

    // Mapping from purchase order ID to approved address
    //mapping (uint256 => address) private _approbationBon;

    // Mapping from owner to number of owned purchase order
    mapping (address => Counters.Counter) private _bonsDetenus;

    // Mapping from owner to operator approvals
    //mapping (address => mapping (address => bool)) private _operatorApprovals;

    // List of suppliers
    struct Fournisseur {
        address id;
        address client;
        string nom;
        string localisation;
        uint[] bonsDeCommande;
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
    }

    BonDeCommande[] public bons;
    mapping(uint => uint) _indexBon;
    uint b = 0;


    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
    /*
     * 0x80ac58cd ===
     *     bytes4(keccak256('balanceOf(address)')) ^
     *     bytes4(keccak256('ownerOf(uint256)')) ^
     *     bytes4(keccak256('approve(address,uint256)')) ^
     *     bytes4(keccak256('getApproved(uint256)')) ^
     *     bytes4(keccak256('setApprovalForAll(address,bool)')) ^
     *     bytes4(keccak256('isApprovedForAll(address,address)')) ^
     *     bytes4(keccak256('transferFrom(address,address,uint256)')) ^
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256)')) ^
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)'))
     */

    constructor (string memory _nom, string memory _localisation, string memory _tva) public {
        // register the supported interfaces to conform to ERC721 via ERC165
        _registerInterface(_INTERFACE_ID_ERC721);
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
    
    function debugSecret(string memory debug) public pure returns(bytes32){
        return keccak256(abi.encodePacked(debug));
    }

    /**
     * @dev Public function to activate the supplier account.
     * Set the address to msg.sender
     * @param _secret The supplier's secret
     * @return The order provider
     */
    function activateAccount(bytes32 _secret) public returns (address){
        uint i = _activation[_secret];
        require( i >= 1, "Ce code n'existe pas ou a déjà été utilisé");
        fournisseurs[i].id = msg.sender;
        _activation[_secret] = 0;
        return fournisseurs[i].client;

    }

    /**
     * @dev Public function to mint a new order.
     * Reverts if the given purchase order ID already exists.
     * @param to The address that will own the minted order
     * @param _numBon uint256 ID of the order to be minted
     * @param _montant valeur du bon
     * @param _description description du bon
     */
    function _mint(address to, uint256 _numBon, uint256 _montant, string memory _description) public {
        require(to != address(0),"Vous ne pouvez transférer ce bon à une adresse vide");
        require(_indexFournisseur[to] >= 1,"Veuillez enregistrer votre fournisseur d'abord");
        require(!_exists(_numBon),"Ce numéro de bon existe déjà");
        _detenteurBon[_numBon] = to;
        _bonsDetenus[to].increment();

        BonDeCommande memory nouveauBon;
        nouveauBon.numBon = _numBon;
        nouveauBon.proprietaires[0] = msg.sender;
        nouveauBon.montant = _montant;
        nouveauBon.rang = 1;
        nouveauBon.description = _description;
        bons.push(nouveauBon);
        _indexBon[_numBon] = b;
        b++;

        emit Transfer(address(0), to, _numBon);
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
     * @param owner address to query the balance of
     * @return uint256 representing the amount owned by the passed address
     */
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0));
        return _bonsDetenus[owner].current();
    }

    /**
     * @dev Gets the owner of the specified order number.
     * @param numBon uint256 ID of the purchase order to query the owner of
     * @return address currently marked as the owner of the given purchase order ID
     */
    function ownerOf(uint256 numBon) public view returns (address) {
        address owner = _detenteurBon[numBon];
        require(owner != address(0));
        return owner;
    }

    /**
     * @dev Approves another address to transfer the given purchase order ID
     * The zero address indicates there is no approved address.
     * There can only be one approved address per purchase order at a given time.
     * Can only be called by the purchase order owner or an approved operator.
     * @param to address to be approved for the given purchase order ID
     * @param numBon uint256 ID of the purchase order to be approved
     */
    /*function approve(address to, uint256 numBon) public {
        address owner = ownerOf(numBon);
        require(to != owner);
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender));

        _approbationBon[numBon] = to;
        emit Approval(owner, to, numBon);
    }*/

    /**
     * @dev Gets the approved address for a purchase order ID, or zero if no address set
     * Reverts if the purchase order ID does not exist.
     * @param numBon uint256 ID of the purchase order to query the approval of
     * @return address currently approved for the given purchase order ID
     */
    /*function getApproved(uint256 numBon) public view returns (address) {
        require(_exists(numBon));
        return _approbationBon[numBon];
    }*/

    /**
     * @dev Sets or unsets the approval of a given operator
     * An operator is allowed to transfer all purchase orders of the sender on their behalf.
     * @param to operator address to set the approval
     * @param approved representing the status of the approval to be set
     */
    /*function setApprovalForAll(address to, bool approved) public {
        require(to != msg.sender);
        _operatorApprovals[msg.sender][to] = approved;
        emit ApprovalForAll(msg.sender, to, approved);
    }*/

    /**
     * @dev Tells whether an operator is approved by a given owner.
     * @param owner owner address which you want to query the approval of
     * @param operator operator address which you want to query the approval of
     * @return bool whether the given operator is approved by the given owner
     */
    /*function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }*/

    /**
     * @dev Transfers the ownership of a given purchase order ID to another address.
     * Usage of this method is discouraged, use `safeTransferFrom` whenever possible.
     * Requires the msg.sender to be the owner, approved, or operator.
     * @param from current owner of the purchase order
     * @param to address to receive the ownership of the given purchase order ID
     * @param numBon uint256 ID of the purchase order to be transferred
     */
    function transferFrom(address from, address to, uint256 numBon) public {
        require(ownerOf(numBon) == msg.sender, "Vous n'êtes pas propriétaire de ce bon de commande");

        _transferFrom(from, to, numBon);
    }

    /**
     * @dev Safely transfers the ownership of a given purchase order ID to another address
     * If the target address is a contract, it must implement `onERC721Received`,
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     * @param from current owner of the purchase order
     * @param to address to receive the ownership of the given purchase order ID
     * @param numBon uint256 ID of the purchase order to be transferred
     */
    function safeTransferFrom(address from, address to, uint256 numBon) public {
        safeTransferFrom(from, to, numBon, "");
    }

    /**
     * @dev Safely transfers the ownership of a given purchase order ID to another address
     * If the target address is a contract, it must implement `onERC721Received`,
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     * @param from current owner of the purchase order
     * @param to address to receive the ownership of the given purchase order ID
     * @param numBon uint256 ID of the purchase order to be transferred
     * @param _data bytes data to send along with a safe transfer check
     */
    function safeTransferFrom(address from, address to, uint256 numBon, bytes memory _data) public {
        transferFrom(from, to, numBon);
        require(_checkOnERC721Received(from, to, numBon, _data));
    }

    /**
     * @dev Returns whether the specified purchase order exists.
     * @param numBon uint256 ID of the purchase order to query the existence of
     * @return bool whether the purchase order exists
     */
    function _exists(uint256 numBon) internal view returns (bool) {
        address owner = _detenteurBon[numBon];
        return owner != address(0);
    }

    /**
     * @dev Returns whether the given spender can transfer a given purchase order ID.
     * @param spender address of the spender to query
     * @param numBon uint256 ID of the purchase order to be transferred
     * @return bool whether the msg.sender is approved for the given purchase order ID,
     * is an operator of the owner, or is the owner of the purchase order
     */
    /*function _isApprovedOrOwner(address spender, uint256 numBon) internal view returns (bool) {
        address owner = ownerOf(numBon);
        return (spender == owner || getApproved(numBon) == spender || isApprovedForAll(owner, spender));
    }*/


    /**
     * @dev Internal function to burn a specific purchase order.
     * Reverts if the purchase order does not exist.
     * Deprecated, use _burn(uint256) instead.
     * @param owner owner of the purchase order to burn
     * @param numBon uint256 ID of the purchase order being burned
     */
    function _burn(address owner, uint256 numBon) internal {
        require(ownerOf(numBon) == owner);

        //_clearApproval(numBon);

        _bonsDetenus[owner].decrement();
        _detenteurBon[numBon] = address(0);

        emit Transfer(owner, address(0), numBon);
    }

    /**
     * @dev Internal function to burn a specific purchase order.
     * Reverts if the purchase order does not exist.
     * @param numBon uint256 ID of the purchase order being burned
     */
    function _burn(uint256 numBon) internal {
        _burn(ownerOf(numBon), numBon);
    }

    /**
     * @dev Internal function to transfer ownership of a given purchase order ID to another address.
     * As opposed to transferFrom, this imposes no restrictions on msg.sender.
     * @param from current owner of the purchase order
     * @param to address to receive the ownership of the given purchase order ID
     * @param numBon uint256 ID of the purchase order to be transferred
     */
    function _transferFrom(address from, address to, uint256 numBon) internal {
        require(ownerOf(numBon) == from);
        require(to != address(0));

        //_clearApproval(numBon);

        _bonsDetenus[from].decrement();
        _bonsDetenus[to].increment();

        _detenteurBon[numBon] = to;

        emit Transfer(from, to, numBon);
    }

    /**
     * @dev Internal function to invoke `onERC721Received` on a target address.
     * The call is not executed if the target address is not a contract.
     * @param from address representing the previous owner of the given purchase order ID
     * @param to target address that will receive the purchase orders
     * @param numBon uint256 ID of the purchase order to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(address from, address to, uint256 numBon, bytes memory _data)
        internal returns (bool)
    {
        if (!to.isContract()) {
            return true;
        }

        bytes4 retval = IERC721Receiver(to).onERC721Received(msg.sender, from, numBon, _data);
        return (retval == _ERC721_RECEIVED);
    }

    /**
     * @dev Private function to clear current approval of a given purchase order ID.
     * @param numBon uint256 ID of the purchase order to be transferred
     */
    /*function _clearApproval(uint256 numBon) private {
        if (_approbationBon[numBon] != address(0)) {
            _approbationBon[numBon] = address(0);
        }
    }*/
}
