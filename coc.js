var dapp;
var user;


async function goToOperations(){
  await window.location.assign('operations.html');
}

async function goToIndex(){
  await window.location.replace('index.html');
}


// retourne 0 si l'utilisateur est un fournisseur en haut de chaîne
// retourne 1 si l'utilisateur est un fournisseur non en haut de chaîne
// retroune 2 si l'utilisateur n'est pas un fournisseur enregistré
async function qualification(){

var isSupplier = await dapp.coc._existsFournisseur(user);
    if (isSupplier){
        var isAdmin = await dapp.coc._isHigherSupplier(user);
        if (isAdmin){
            return 0;
        }else{
            return 2;
        }
    }else{
        return 1;
    }
}


async function redirection(){

    dapp = await load();
    user = await dapp.user;
    var quali = await qualification();

    if (quali == 0){
        document.getElementById("bienvenue").innerHTML = "bienvenue admin";
        afficherFournisseurs();
        //proposer une nouvelle commande
    }
    else if (quali == 1){
      document.getElementById("bienvenue").innerHTML = "Vous n'avez pas de droit d'accès à cette page.";
    }else if (quali == 2){
      document.getElementById("bienvenue").innerHTML = "bienvenue fournisseur";
      afficherFournisseurs();
      //affichage de bons
      //propose un forward

    }
}

async function nouveauFournisseur(){
    let _nom = document.getElementById("nom").value ;
    let _location = document.getElementById("location").value;
    let _tva = document.getElementById("tva").value;
    if (_nom == null || _location == null || _tva == null || _nom == "" || _location == "" || _tva == ""){
      alert("Merci de renseigner une valeur pour le nom, le lieu et la TVA");
      return;
    }
    let _secret;
    _secret = secret();
    alert("test");
    let nouveauFournisseur = await dapp.coc.creerCompteFournisseur(_nom, _location, _tva, _secret);
    console.log(nouveauFournisseur)
    alert("Nouveau compte en attente de validation.");
    return nouveauFournisseur;
}

function secret() {
  let txt;
  let secretCode = prompt("Entrez un code secret:", "code");
  if (secretCode == null || secretCode == "") {
    txt = "Annulation de l'opération";
  } else {
    txt = "Secret ok";
  }
  console.log(txt);
  return secretCode;
}

async function activateAccount(){
    let dapp = await load();    
    let _secretHash = document.getElementById("secretHash").value;
    let secretHash = await dapp.coc.activateAccount(_secretHash);
    console.log(secretHash);
    goToOperations();
}

async function afficherFournisseurs(){
    document.getElementById("tableauDesFournisseurs").innerHTML = "Veuillez patienter...";
    const f = document.createDocumentFragment();
    let tierOne;
    tierOne = await dapp.coc.listeTierOne(user);
    console.log(tierOne);
    let tableau = `
    <table>
    <thead>
      <tr>
        <th>Index</th>
        <th>Nom</th>
        <th>Localisation</th>
        <th>TVA</th>
        <th>Contact</th>
        <th>Bons</th>
        <th>Tier One</th>
      </tr>
    </thead>`
    for (x of tierOne){
      let f ;
        f = await dapp.coc.fournisseursAttributes(x);
        tableau +=
          `<tbody class="thead-light">
            <tr>
              <th scope="row">${tierOne.indexOf(x) + 1}</th>
              <td>${f.nom}</td>
              <td>${f.localisation}</td>
              <td>${f.TVA}</td>
              <td>
                <span><button onclick="contacter()">Contacter</span>
              </td>
              <td>
                <span><button onclick="consulterTierOne()">Consulter</span>
              </td>
              <td>
                <span><button onclick="consulterBons()">Consulter</span>
              </td>


              `
    }
    tableau += `<tbody>
    <tr>
      <td><span><button onclick="nouveauFournisseur()">Ajouter un nouveau fournisseur</span></td>
      <td><input type ="text" id ="nom" placeholder="Nom"></input></td>
      <td><input type ="text" id ="location" placeholder="Location"></input></td>
      <td><input type ="text" id ="tva" placeholder="n° TVA"></input></td>
      <td><input type ="text" id ="mail" placeholder="supplier@mail.here"></input></td>
      <td></td>
      <td></td>
      </tr>
    </tbody>
    </table>`

    doc = document.createElement("div");
            doc.innerHTML = tableau;
            f.appendChild(doc);
            document.getElementById("tableauDesFournisseurs").innerHTML = "";
            document.getElementById("tableauDesFournisseurs").appendChild(f);
}

async function operations(){
    try{
        document.getElementById("carnetDeCommande").innerHTML = "";
    }finally{
        console.log("refresh");
    }

    document.getElementById("carnetDeCommande").innerHTML = "Veuillez patienter...";
    const f = document.createDocumentFragment();
    try{
    let BonsDeCommande = await dapp.coc.listeBons();

        let tableau = `
            <table>
              <thead>
                <tr>
                  <th scope="col>Index</th>
                  <th scope="col>Bon de commande</th>
                  <th scope="col">Montant</th>
                  <th scope="col">Propriétaire</th>
                  <th scope="col">Echéance</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>`


    
    let creances = dapp.coc.listeDeCommandes(dapp.user);
    console.log(creances.length);
    if(creances.length   > 0) {
        for(x of creances) {
            index = creances.indexOf(x);
            cand = document.createElement("div");
            //let i = 0; 
            for(c of x.candidats){ 
                cand.innerHTML += c.toLowerCase() + "<br>" ; 
                //i ++; 
            }
            cand.innerHTML += `<td>
            <div style="display:inline-block"><button onclick="postuler(${index})" class="btn btn-info">Concourir</div><br>
            <br><div style="display:inline-block"><button onclick="accepter(${index} )" class="btn btn-info">Choisir un candidat</div>
            </td>` ;


                tableau +=
           `<tbody class="thead-light">
             <tr>
               <th scope="row" class="text-center">${index}</th>
               <td align="center">${x.description}</td>
               <td align="center">${x.repMin}</td>
               <td align="center">${x.remuneration / 1000000000 } ethers</td>
               <td align="center">${x.deliveryTime} jours</td>
               <td align="center">${cand.outerHTML}</td>
               <td align="center">${conversionStatut(x.etat)}</td>
               <td align="center">${x.emetteur}
               <div id="commentEntreprise">
                    <button onclick="commenterEntreprise(${index})" class="btn btn-success">Laisser un commentaire à l'entreprise
               </div></td>
               <td align="center">${x.illustrator}
               <div id="commentIllustrateur">
                    <button onclick="commenterIllustrateur(${index})" class="btn btn-success">Laisser un commentaire à l'illustrateur
               </div></td>
               <td align="center">${x.hashUrl}
               <div id="hash">
                    <button onclick="remettre(${index})" class="btn btn-success">Remettre une illustration
               </div>
               </td>
               <td>
               <div>
                    <button onclick="retard(${index})" class="btn btn-warning">Pénaliser un retard
               </div><br>
               <div>
                    <button onclick="refuser(${index})" class="btn btn-danger">Refuser une oeuvre
               </div>
               </td>
             </tr>
           </tbody>`
           
        }
    }else{
            index = 0;

        }
            tableau += `<tbody>
            <tr class="p-3 mb-2 bg-light text-dark">
              <th scope="row"><span><button onclick="soumettre(${index})" class="btn btn-warning">Soumettre un projet</span><br>
              <td><input type="text" id="desc" class="form-control" placeholder="Descript."></td>
              <td><input type="text" id="repmin" class="form-control" placeholder="Rep min"></td>
              <td><input type="text" id="rem" class="form-control" placeholder="Remunérat°"></td>
              <td><input type="text" id="timing" class="form-control" placeholder="Delai (jour)"></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              </td>
            </tr>
            <th scope="row"></th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <tr>
            </tr>
          </tbody>
          </table>`;
            doc = document.createElement("div");
            doc.innerHTML = tableau;
            f.appendChild(doc);
            document.getElementById("carnetDeCommande").innerHTML = "";
            document.getElementById("carnetDeCommande").appendChild(f);
        
        //} else {
         //   document.getElementById("creances").innerHTML = "Enregistrez votre première offre!"
            

    
    
    console.log(creances);
    
    } catch (err) {
    //Gestion des erreurs
    //alert(err)
    console.error(err);
    }
}



async function mint(){
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
