var dapp;
var user;
var quali;

async function transferWindow(indexF, numBon){
  let userAddress = await dapp.coc.fournisseurs(indexF);
  let tierOne = await dapp.coc.listeTierOne(userAddress.id);
  if (tierOne.length == 0){
      alert("Vous devez avoir enregistré au moins un fournisseur")
  }else{
  localStorage.setItem("indexF", indexF);

  let bon = await dapp.coc.bonsAttributes(numBon);
  let montant = bon.montant;
  localStorage.setItem("montant", montant);
  localStorage.setItem("numBon" , numBon)
  await window.open("transferBon.html","mywindow","menubar=1,resizable=1,width=350,height=250");
  }
}

async function transferBon(){
  dapp = await load();

  let numBon = localStorage.getItem("numBon");
  let titreTransfert = "Transfert du bon n° " + numBon;
  document.getElementById("titreTransfert").innerHTML = titreTransfert;

  var indexF = localStorage.getItem("indexF");
  var user = await dapp.coc.fournisseurs(indexF);
  var liste = await dapp.coc.listeTierOne(user.id);
  var select_fournisseur = document.getElementById('fournisseur');
  for (x of liste){
    let supplier;
    [,supplier] = await dapp.coc.fournisseursAttributes(x);
    var opt = document.createElement('option');
    opt.value = supplier.id;
    opt.innerHTML = supplier.nom;
    select_fournisseur.appendChild(opt)
  }

  var montant = localStorage.getItem("montant");
  select_fournisseur = document.getElementById("montant");
  let placeholder_montant = "Montant max :" + montant;
  select_fournisseur.placeholder = placeholder_montant;

}


async function validateTransfer(){
  var montantMax = localStorage.getItem("montant");
  montantMax = parseInt(montantMax);
  var montant = document.getElementById("montant").value ;
  montant = parseInt(montant);
  var fournisseur = document.getElementById("fournisseur").value ;
  var numBon = localStorage.getItem("numBon");


  if (isNaN(montant)){
    alert("Merci de renseigner des valeurs numériques pour le montant à transférer.");
    return;
  }
  if (montant > montantMax){
      alert("Vous ne pouvez renseigner une valeur supérieure à " + montantMax);
    return;
  }
  if (montant <= 0){
    alert("Merci de renseigner une valeur positive non nulle");
  }

  let push = await dapp.coc.pushBon(numBon, montant, fournisseur);
  let indexF = localStorage.getItem("indexF");
  console.log(push);
  afficherBons(indexF);
  alert("Virement effectué.");
  localStorage.clear();
  self.close();
}


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
    var nomFournisseur = supplier.nom 
    quali = await qualification();

    if (quali == 0){
        document.getElementById("bienvenue").innerHTML = "bienvenue admin " + nomFournisseur;
        afficherFournisseurs(index);

    }
    else if (quali == 1){
      document.getElementById("bienvenue").innerHTML = "Vous n'avez pas de droit d'accès à cette page.";
    }else if (quali == 2){
      document.getElementById("bienvenue").innerHTML = "bienvenue fournisseur " + nomFournisseur;
      afficherFournisseurs(index);
      afficherBons(index);
      //propose un forward

    }
}

async function nouveauFournisseur(){
    dapp.coc.on("Secret", (secret) => {
      iframe.style.display = "none";
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
    document.getElementById("nom").value = "";
    document.getElementById("location").value ="";
    document.getElementById("tva").value = "";
    document.getElementById("mail").value = "";
    document.getElementById("nom").placeholder = _nom;
    document.getElementById("location").placeholder = _location;
    document.getElementById("tva").placeholder = _tva;
    document.getElementById("mail").placeholder = _mail;
    dapp.coc.creerCompteFournisseur(_nom, _location, _tva, _mail, _secret)
        .then((secret)=>{
            console.log(secret);
        });
    var iframe = document.createElement('iframe');
        iframe.src="https://giphy.com/gifs/iLuuWPPytEZqM/html5"
        iframe.width="480"
        iframe.height="414"
        iframe.frameBorder="0"
        iframe.class="giphy-embed"
        document.body.appendChild(iframe);
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
      iframe.style.display = "none";
      goToOperations();
    });
    let _secretHash = document.getElementById("secretHash").value;
    document.getElementById("secretHash").value = "";
    document.getElementById("secretHash").placeholder = _secretHash;
    let secretHash = await dapp.coc.activateAccount(_secretHash);
    console.log(secretHash);
    var iframe = document.createElement('iframe');
    iframe.src="https://giphy.com/gifs/iLuuWPPytEZqM/html5"
    iframe.width="480"
    iframe.height="414"
    iframe.frameBorder="0"
    iframe.class="giphy-embed"
    document.body.appendChild(iframe);
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
    var tableauFournisseur = `**** Tableau des fournisseurs de ${userAddress.nom} ****`
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
    let i;
    i = 0;
    for (x of tierOne){
      let supplier;
      let index;
      [index,supplier] = await dapp.coc.fournisseursAttributes(x);
      i++
      tableauFournisseur +=
          `<tbody class="thead-light">
            <tr>
              <th scope="row">${i}</th>
              <td>${supplier.nom}</td>
              <td>${supplier.localisation}</td>
              <td>${supplier.tva}</td>
              <td>
                <span><button onclick="javascript: window.location.href='${supplier.mail}';">Contacter</span>
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
    var tableauBon = ` ****Tableau des bons de ${userAddress.nom}****
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
  let i;
  i = 0;
  for (x of numBons){
      let bon = await dapp.coc.bonsAttributes(x);
      let em = convertTime(bon.dateEmission)
      em = em.toLocaleDateString()

      let ec = convertTime(bon.echeance)
      ec = ec.toLocaleDateString()
      tableauBon +=
        `<tbody class="thead-light">
          <tr>
            <th scope="row">${i + 1}</th>
            <td><button onclick="tableauDesBons(${index})">Détails du bon n° ${bon.numBon}</td>
            <td>${montant[i]}</td>
            <td>${bon.description}</td>
            <td>${em}</td>
            <td>${ec}</td>
            <td>${bon.rang}</td>
            <td>`
              if (quali == 2){
                tableauBon +=
              `<div><button onclick="transferWindow(${index}, ${bon.numBon})">Utiliser ce bon pour paiement</div>`
              }
              tableauBon +=
              `</td>`
              i++;
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
    iframe.style.display = "none";
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
  console.log(nouveauBonEmis);
  var iframe = document.createElement('iframe');
  iframe.src="https://giphy.com/gifs/iLuuWPPytEZqM/html5"
  iframe.width="480"
  iframe.height="414"
  iframe.frameBorder="0"
  iframe.class="giphy-embed"
  document.body.appendChild(iframe);

  
}
