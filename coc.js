var dapp;
var user;
var quali 

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
    let supplier;
    let index;
    [index,supplier] = await dapp.coc.fournisseursAttributes(user); 
    console.log(index);
    console.log(supplier);
    quali = await qualification();

    if (quali == 0){
        document.getElementById("bienvenue").innerHTML = "bienvenue admin";
        afficherFournisseurs(index);

    }
    else if (quali == 1){
      document.getElementById("bienvenue").innerHTML = "Vous n'avez pas de droit d'accès à cette page.";
    }else if (quali == 2){
      document.getElementById("bienvenue").innerHTML = "bienvenue fournisseur";
      afficherFournisseurs(index);
      afficherBons(index);
      //propose un forward

    }
}

async function nouveauFournisseur(){

    dapp.coc.on("Secret", (secret) => {
      alert("Nouveau compte en attente de validation. Code à transmettre à votre fournisseur :" + secret);
    });

    let _nom = document.getElementById("nom").value ;
    let _location = document.getElementById("location").value;
    let _tva = document.getElementById("tva").value;
    let _mail = document.getElementById("mail").value;
    if (_nom == null || _location == null || _tva == null || _mail == null || _nom == "" || _location == "" || _tva == "" || _mail == ""){
      alert("Merci de renseigner une valeur pour le nom, le lieu et la TVA");
      return;
    }
    let _secret;
    _secret = secret();

    dapp.coc.creerCompteFournisseur(_nom, _location, _tva, _mail, _secret)
        .then((secret)=>{
            console.log(secret);
        });
  
    

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
    dapp.coc.on("Activate", (secret) => {
      goToOperations();
    });
    let _secretHash = document.getElementById("secretHash").value;
    let secretHash = await dapp.coc.activateAccount(_secretHash);
    console.log(secretHash);
}

async function afficherFournisseurs(index){
    document.getElementById("tableauDesFournisseurs").innerHTML = "Veuillez patienter...";
    const f = document.createDocumentFragment();
    let tierOne;
    let userAddress = await dapp.coc.fournisseurs(index);
    tierOne = await dapp.coc.listeTierOne(userAddress.id);
    if (tierOne.length == 0){
    var tableauFournisseur = `Enregistrez votre premier fournisseur.`
    }else{
    var tableauFournisseur = `**** Tableau des fournisseurs ****`
    }
    tableauFournisseur += `
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
      let supplier;
      let index;
      [index,supplier] = await dapp.coc.fournisseursAttributes(x);
      let numero = tierOne.indexOf(x) + 1;
      tableauFournisseur +=
          `<tbody class="thead-light">
            <tr>
              <th scope="row">${numero}</th>
              <td>${supplier.nom}</td>
              <td>${supplier.localisation}</td>
              <td>${supplier.tva}</td>
              <td>
                <span><button onclick="contacter(${supplier.mail})">Contacter</span>
              </td>
              <td>
                <span><button onclick="afficherBons(${index})">Consulter</span>
              </td>
              <td>
                <span><button onclick="afficherFournisseurs(${index})">Consulter</span>
              </td>`
    }

    tableauFournisseur += `<tbody>
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
            doc.innerHTML = tableauFournisseur;
            f.appendChild(doc);
            document.getElementById("tableauDesFournisseurs").innerHTML = "";
            document.getElementById("tableauDesFournisseurs").appendChild(f);
}


async function afficherBons(index){
  document.getElementById("tableauDesBons").innerHTML = "Veuillez patienter...";
  const f = document.createDocumentFragment();
  
  let userAddress = await dapp.coc.fournisseurs(index);
  [numBons, montant] = await dapp.coc.listeDeCommandes(userAddress.id);
    if (numBons.length == 0 && quali !=0){
    var tableauBon = `Aucun bon référencé pour le moment.`
    } else {
    var tableauBon = ` ****Tableau des bons****
  <table>
  <thead>
    <tr>
      <th>Index</th>
      <th>Numéro de bon</th>
      <th>Montant</th>
      <th>Description</th>
      <th>Date d'émission</th>
      <th>Date d'échéance</th>
      <th>Rang</th>
      <th>Opérations</th>
    </tr>
  </thead>`
  for (x of numBons){
      let bon = await dapp.coc.bonsAttributes(x);
      let montantTemp = montant.indexOf(x) + 1; //erreur


      // var time = new Date().getTime();
      // var date = new Date(time);
      // alert(date.toString());

      let em = convertTime(bon.dateEmission)
      em = em.toLocaleDateString()

      let ec = convertTime(bon.echeance)
      ec = ec.toLocaleDateString()

      tableauBon +=
        `<tbody class="thead-light">
          <tr>
            <th scope="row">${montantTemp +1}</th>
            <td>${bon.numBon}</td>
            <td>${montant[montantTemp]}</td>
            <td>${bon.description}</td>
            <td>${em}</td>
            <td>${ec}</td>
            <td>${bon.rang}</td>
            <td>
              <div><button onclick="tableauDesBons(${index})">Consulter le Bon</div>`
              
              if (quali == 2){
                tableauBon +=
              `
              <div><button onclick="tableauDesBons(${index})">Utiliser ce bon pour paiement</div>`
              }
              tableauBon +=
              `</td>`
  }

  if (quali == 0){
    let d = new Date();
    let now = d.toLocaleDateString();
    tableauBon += `<tbody>
  <tr>
    <td><span><button onclick="nouveauBon(${index})">Emettre un nouveau bon</span></td>
    <td><input type ="text" id ="numbon" placeholder="Numéro de bon"></input></td>
    <td><input type ="text" id ="montant" placeholder="Montant"></input></td>
    <td><input type ="text" id ="description" placeholder="Descriptions"></input></td>
    <td>${now}</td>
    <td><input type ="date" id ="echeance" placeholder="Date d'échéance"></input></td>
    <td>1</td>
    </tr>
  </tbody>
  </table>`
    }
  }
  doc = document.createElement("div");
          doc.innerHTML = tableauBon;
          f.appendChild(doc);
          document.getElementById("tableauDesBons").innerHTML = "";
          document.getElementById("tableauDesBons").appendChild(f);
  
}

function convertTime(_time){
  let time;
  time = _time;
  time = time / 1;
  var dateTime = new Date(time);
  return dateTime
}

async function nouveauBon(index){
  dapp.coc.on("NouveauBon", (_numbon) => {
    alert("Nouveau bon émis.");
    afficherBons(index);
  });
  let now = new Date();
  let _to = await dapp.coc.fournisseurs(index); 
  let _numbon = document.getElementById("numbon").value ;
  let _montant = document.getElementById("montant").value;
  let _description = document.getElementById("description").value;
  let _echeance = document.getElementById("echeance").value;
  _echeance = Date.parse(_echeance);
  if (_numbon == null || _montant == null || _description == null || _echeance == null || _numbon == "" || _montant == "" || _description == "" || _echeance == ""){
    alert("Merci de renseigner une valeur pour le numéro de bon, son montant, une description et son échéance");
    return;
  }
  if (isNaN(_numbon)||isNaN(_montant)){
    alert("Merci de renseigner des valeurs numériques pour le numéro de bon et le montant.");
    return;
  }
  if (_echeance <= now){
    alert("Merci de renseigner une date d'échéance future");
    return;

  }
  let nouveauBonEmis = await dapp.coc._mint(_to.id, _numbon, _montant, _description, now.getTime(), _echeance);

  
}
