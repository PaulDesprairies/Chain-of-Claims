function index(){
window.location.replace('index.html');
}


async function afficheBonsDeCommande() {
    
    window.location.replace('index.html');
    document.getElementById("carnetDeCommande").innerHTML = "Veuillez patienter...";
    
    await load();
    // create fragment
    const f = document.createDocumentFragment();
    // loop offers
    
    let  nbBonsDeCommande = await dapp.coc.funWith2DArray();
        alert(nbBonsDeCommande)
    }



async function mint(){
    await load();
    tokenID = Math.floor(Math.random() * 1000) + 1; 
    try{
    let list = await (dapp.coc._mint(dapp.user, tokenID));
    alert("Vous venez de générer le token " + tokenID);

    }catch (err) {
        // Gestion des erreurs
        alert("Opération abandonnée")
        console.error(err);
}
}