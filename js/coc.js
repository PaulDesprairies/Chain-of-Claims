var dapp;
var user;
var quali;
var iframe;
var loadingObject;



async function transferWindow(indexF, numBon){
  var userAddress = await dapp.coc.fournisseurs(indexF);
  var tierOne = await dapp.coc.listeTierOne(userAddress.id);
  if (tierOne.length == 0){
    let info =""  ;
    // info += 
    // `<div class="alert alert-warning alert-dismissible fade in">
    // <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
    // <strong>Warning!</strong> Vous devez avoir enregistré au moins un fournisseur.
    // </div><br>`;

    // document.getElementById("infoBons").innerHTML = info;

    alert("Vous devez avoir enregistré au moins un fournisseur")
    }else{
    localStorage.setItem("indexF", indexF);


  let indexBon 
  [,indexBon]= await dapp.coc.checkIfHeldBon(userAddress.id, numBon);

  let montant;
  [,montant]= await dapp.coc.listeDeCommandes(userAddress.id);
  localStorage.setItem("montant", montant[indexBon]);
  localStorage.setItem("numBon" , numBon)
  localStorage.setItem("envoyeur",userAddress.nom)
  await window.open("transferBon.html","mywindow","menubar=1,resizable=1,width=250,height=420");
  }
}

async function pushBon(){
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
    select_fournisseur.appendChild(opt);
  }

  var montant = localStorage.getItem("montant");
  select_fournisseur = document.getElementById("montant");
  let placeholder_montant = "Montant max :" + montant;
  select_fournisseur.placeholder = placeholder_montant;

}

function calculPourcentage(){

let percent = document.getElementById("montant").value;
let max = localStorage.getItem("montant");
percent = percent * 100 / max;
percent = Math.round(percent * 100);
percent = percent / 100;
document.getElementById("pourcentage").innerHTML = percent + "% du montant max.";
}

async function validateTransfer(){

  dapp.coc.on("PushBon", () => {
    iframe.style.display = "none";
    alert("Virement effectué.");
    localStorage.clear();
    if (document.getElementById("mailTransfer").checked == true){
      window.location.assign('mailto:' + supplier.mail + '?subject=' + fournisseurNom + '%20veut%20vous%20envoyer%20un%20financement.&body=Rendez-vous%20sur%20http://127.0.0.1:8080/Chain-of-Claims/index.html');
    }else{
      self.close();
    }
    

  });
  var montantMax = localStorage.getItem("montant");
  var fournisseurNom = localStorage.getItem("envoyeur");
  montantMax = parseInt(montantMax);
  var montant = document.getElementById("montant").value ;
  montant = parseInt(montant);
  var fournisseur = document.getElementById("fournisseur").value ;
  var numBon = localStorage.getItem("numBon");
  let supplier;
  [,supplier] = await dapp.coc.fournisseursAttributes(fournisseur);


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
  try {
  await dapp.coc.pushBon(numBon, montant, fournisseur);

  }catch (err){
    // Gestion des erreurs
    console.error(err);
    alert(err);
  }
  //console.log(push);
  patientez();
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
        document.getElementById("bienvenue").innerHTML = "Bienvenue " + nomFournisseur +".<br> <strong>Admin</strong>";
        afficherFournisseurs(index);

    }
    else if (quali == 1){
      document.getElementById("bienvenue").innerHTML = "Vous n'avez pas de droit d'accès à cette page.";
    }else if (quali == 2){
      document.getElementById("bienvenue").innerHTML = "Bienvenue " + nomFournisseur +".<br> <strong>Fournisseur</strong> ";
      afficherFournisseurs(index);
      afficherBons(index);

    }
}

async function whoAmI(){
  let supplier;
  [,supplier] = await dapp.coc.fournisseursAttributes(user); 
  var nomFournisseur = supplier.nom ;
  var tvaFournisseur = supplier.tva;
  var localisationFournisseur = supplier.localisation;
  await window.location.replace('operations.html');
  console.log("Ce qu'on sait de vous : \n\nNom : " + nomFournisseur + "\nTVA :" +tvaFournisseur + "\nLocalisation :" +localisationFournisseur)
}

async function nouveauFournisseur(){
    dapp.coc.on("Secret", (secret) => {
      iframe.style.display = "none";
      alert("Nouveau compte en attente de validation. /nNDA envoyé. /nDocuments de garanties envoyés. /nClé publique :" + secret);
    });

    let _nom = document.getElementById("nom").value ;
    let _location = document.getElementById("location").value;
    let _tva = document.getElementById("tva").value;
    let _mail = document.getElementById("mail").value;
    if (_nom == null || _location == null || _tva == null || _mail == null || _nom == "" || _location == "" || _tva == "" || _mail == ""){
      alert("Merci de renseigner une valeur pour le nom, le lieu et la TVA");
      return;
    }
    let check;
    let _secret;
    [check, _secret] = secret();
    if(!check){
      return;
    }

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
    patientez();
}

function secret() {
  var check;
  var secretCode = prompt("Entrez la clé privée transmise par votre fournisseur:", "privateKey");
  if (secretCode == null || secretCode == "") {
    check = false;
  } else {
    check = true;
  }
  console.log(check);
  return [check,secretCode];
}

function checkSecret(){
  let _secretHash = ""
  _secretHash = document.getElementById("secretHash").value;
if (_secretHash == ""){
  alert("Merci de vous rapprocher de votre client pour intégrer le programme.");
  return
}
activateAccount()
}
async function activateAccount(){
    let dapp = await load();    

    dapp.coc.on("Activate", () => {
      iframe.style.display = "none";
      goToOperations();
    });
    _secretHash = document.getElementById("secretHash").value;
    document.getElementById("secretHash").placeholder = _secretHash;
    window.open('https://file.globalupload.io/0kUUBQ6tm4.pdf', '_blank');
    if (confirm("Vous vous apprétez à rejoindre un écosystème fermé décentralisé et réglementé. En continuant, vous vous engagez à signer un NDA et les documents de garanties. Continuer ?")){

    } else {
        alert("Operation abandonnée")
        return
    }
    let secretHash = await dapp.coc.activateAccount(_secretHash);
    console.log(secretHash);


    patientez();
}

async function afficherFournisseurs(index){
  const f = document.createDocumentFragment();
    let currentUser = await dapp.user;
    var rangUser;
    let rangRelatif;
    [,rangUser] = await dapp.coc.fournisseursAttributes(currentUser);
    let userAddress = await dapp.coc.fournisseurs(index);
    rangRelatif = userAddress.rang - rangUser.rang + 1; 
    document.getElementById("tableauDesFournisseurs").innerHTML = "Veuillez patienter...";
    let tierOne;
    var tableauFournisseur = "";
    tierOne = await dapp.coc.listeTierOne(userAddress.id);
    if (tierOne.length == 0 && rangRelatif == 1){
      tableauFournisseur = `<h4>Enregistrez votre premier fournisseur.</h4>`
    }else if (tierOne.length > 0) {
      tableauFournisseur = `<h2> Tableau des fournisseurs de ${rangUser.nom} <small>(Tiers - ${rangRelatif})</small> <h2>`
    }
    tableauFournisseur += `
    <table id="tablestyle" class="table-hover">
    <thead>
      <tr>
        <th>Index</th>
        <th>Nom</th>
        <th>Localisation</th>
        <th>TVA</th>
        <th>Contact</th>`

        if (quali == 0 && rangRelatif == 1){
          tableauFournisseur +=  `
          <th>Emettre bon</th>`
        }else{
          tableauFournisseur +=`
          <th>Consulter bons</th>`
      }
      tableauFournisseur +=`
      <th style="width:150px">Tier-1</th>
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
          `<tbody>
            <tr>
              <th scope="row">${i}</th>
              <td>${supplier.nom}</td>
              <td>${supplier.localisation}</td>
              <td>${supplier.tva}</td>
              <td>
                <span><a href="mailto:${supplier.mail}?subject=${rangUser.nom}%20veut%20vous%20envoyer%20un%20financement.&body=Rendez-vous%20sur%20http://127.0.0.1:8080/Chain-of-Claims/index.html" class = "fa fa-paper-plane" aria-hidden="true"  id="icon"></a></span>
              </td>`
              if (quali == 0 && rangRelatif == 1){
                tableauFournisseur += `
              <td>
                <span><a href="#" onclick="afficherBons(${index})" class= "fas fa-plus-square" aria-hidden="true" id="icon"></a></span>
              </td>`
              }else if (quali == 0 && rangRelatif > 1){
                tableauFournisseur += `
              <td>
                <span><a href="#" onclick="afficherBons(${index})" class= "fa fa-search" aria-hidden="true" id="icon"></a></span>
              </td>`
              }else{
                tableauFournisseur += `
                <td>
                <span><a href="#" onclick="afficherBons(${index})" class= "fa fa-search" aria-hidden="true" id="icon"></a></span>
              </td>`
              }
              tableauFournisseur += `
              <td>
                <span><a href="#" onclick="afficherFournisseurs(${index})" class="fa fa-search" aria-hidden="true" id="icon"></a></span>
              </td>`
    }

    if (rangRelatif == 1){
    tableauFournisseur += `
    <tr>
      <td><span ><button class= "btn btn-light" onclick="nouveauFournisseur()" >Ajouter un nouveau fournisseur</span></td>
      <td><input class= "form-group" type ="text" id ="nom" placeholder="Nom"></input></td>
      <td><input class= "form-group" type ="text" id ="location" placeholder="Location"></input></td>
      <td><input class= "form-group" type ="text" id ="tva" placeholder="n° TVA"></input></td>
      <td><input class= "form-group" type ="text" id ="mail" placeholder="supplier@mail.here"></input></td>
      <td></td>
      <td></td>
    </tr>`
    } else{
      tableauFournisseur += `
      <tr>
      <td id="footertable"></td>
      <td id="footertable"></td>
      <td id="footertable"></td>
      <td id="footertable"></td>
      <td id="footertable"></td>
      <td id="footertable"></td>
      <td id="footertable"></td>
    </tr>`
    }
    tableauFournisseur += `
    </tbody>
    </table>`
    
    if (tierOne.length == 0 && rangRelatif > 1){
      tableauFournisseur = `<h4>Fin de votre chaîne de fournisseur connue à ce jour</h4>`
    }
    doc = document.createElement("div");
            doc.innerHTML = tableauFournisseur;
            f.appendChild(doc);
            document.getElementById("tableauDesFournisseurs").innerHTML = "";
            document.getElementById("tableauDesFournisseurs").appendChild(f);
}




async function afficherBons(indexF){
  document.getElementById("tableauDesBons").innerHTML = "Veuillez patienter...";
  const f = document.createDocumentFragment();
  let currentUser = await dapp.user;
  let userAddress = await dapp.coc.fournisseurs(indexF);
  var rang = userAddress.rang;
  [numBons, montant] = await dapp.coc.listeDeCommandes(userAddress.id);
    if (numBons.length == 0 && quali !=0){
    var tableauBon = `<h4>Aucun bon référencé pour le moment.</h4>`
    } else {
    var tableauBon = `<h2>Tableau des bons de ${userAddress.nom}</h2>
  <table  id ="tablestyle" class= "table-hover">
  <thead>
    <tr>
      <th id="footertable">Index</th>
      <th id="footertable">Numéro de bon</th>
      <th id="footertable">Montant</th>
      <th id="footertable">Description</th>
      <th id="footertable">Date d'émission</th>
      <th id="footertable">Date d'échéance</th>`

      currentUser = currentUser.toUpperCase();
      userAddress.id = userAddress.id.toUpperCase();
        if (quali == 2 && currentUser == userAddress.id){
          tableauBon +=
      `<th>Opérations</th>`
        }
        tableauBon +=
      `</tr>
  </thead>`
  var now = convertTime(Date.now())
  var i;
  i = 0;
  for (x of numBons){
      let bon = await dapp.coc.bonsAttributes(x);
      let em = convertTime(bon.dateEmission)

      let ec = convertTime(bon.echeance)

      tableauBon +=
        `<tbody>
          <tr>
            <th scope="row">${i + 1}</th>
            <td ><button class="btn btn-light" onclick="afficherDetailsBons(${bon.numBon})">Bon n° ${bon.numBon}</td>
            <td>${montant[i]} wei</td>
            <td>${bon.description}</td>
            <td>${em.toLocaleDateString()}</td>
            <td>${ec.toLocaleDateString()}</td>
            <td>`

              if (quali == 2 && currentUser == userAddress.id){
                if(montant[i] > 0){
                tableauBon +=
                `<br><div><button class="btn btn-success" onclick="transferWindow(${indexF}, ${bon.numBon})">Utiliser ce bon pour paiement</div><br>`
                }else{
                  tableauBon +=
                `<br><div><button class="btn btn-success" disabled = "true" onclick="transferWindow(${indexF}, ${bon.numBon})">Financement effectué.</div><br>`
                }
                
                if(montant[i] > 0){
                if(now<ec){
                  let delta = Math.round((ec-now)/86400000);
                  tableauBon +=
                  `<div ><button class="btn btn-warning" disabled = "true" onclick="burn(${i}, ${bon.numBon})">Bon reboursable dans ${delta} jours</div><br>`
                }else{
                  tableauBon +=
                  `<div><button class="btn btn-warning" onclick="burn(${i}, ${bon.numBon})">Se faire payer ce bon</div><br>`
              }
            }
            }
              tableauBon +=
              `</td>`
              i++;
  
  }


  if (quali == 0 && rang == 1){
    let d = new Date();
    let now = d.toLocaleDateString();
    tableauBon += `<tbody>
  <tr>
    <td><span><button class= "btn btn-success" onclick="nouveauBon(${indexF})">Emettre un nouveau bon</span></td>
    <td><input class= "form-group" type ="text" id ="numbon" placeholder="Numéro de bon"></input></td>
    <td><input class= "form-group" type ="text" id ="montant" placeholder="Montant"></input></td>
    <td><input class= "form-group" type ="text" id ="description" placeholder="Descriptions"></input></td>
    <td>${now}</td>
    <td><input class= "form-group" type ="date" id ="echeance" placeholder="Date d'échéance"></input></td>
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
  if (confirm("Vous vous apprétez à placer " + _montant + " wei en commande. Continuer ?")){

  } else {
      alert("Operation abandonnée")
      return
  }
    let overrides = {
      gasLimit: 3000000,
      value: ethers.utils.parseUnits(_montant, "wei"),
    }


  let nouveauBonEmis = await dapp.coc._mint(_to.id, _numbon, _montant, _description, now.getTime(), _echeance, overrides);
  console.log(nouveauBonEmis);

  patientez();
  
}



async function afficherDetailsBons(numBon){
  document.getElementById("tableauDesBonsDetails").innerHTML = "Veuillez patienter...";
  const f = document.createDocumentFragment();
  let detenteurs = await dapp.coc.listeDeDetenteurs(numBon)

  let currentUser = await dapp.user;
  let rangUser
  [,rangUser] = await dapp.coc.fournisseursAttributes(currentUser);

    var tableauDesBonsDetails
    tableauDesBonsDetails = "";
    tableauDesBonsDetails += `<h2>Tableau des détenteurs du bon n° ${numBon}</h2>
    <table id="tablestyle" class="table-hover">
    <thead>
      <tr>
        <th id="footertable">Index</th>
        <th id="footertable">Nom</th>
        <th id="footertable">Localisation</th>
        <th id="footertable">TVA</th>
        <th id="footertable">Montant détenu</th>
        <th id="footertable">Rang</th>
      </tr>
    </thead>`
    var i;
    i = 0;
for (x in detenteurs){
  let fournisseur;
  [,fournisseur] = await dapp.coc.fournisseursAttributes(detenteurs[x]);
  let indexMontant;
  [,indexMontant] = await dapp.coc.checkIfHeldBon(fournisseur.id, numBon);
  let montant;
  [,montant] = await dapp.coc.listeDeCommandes(fournisseur.id);
  let rangRelatif;
  rangRelatif = fournisseur.rang - rangUser.rang + 1;
  i++;
  tableauDesBonsDetails +=
  `<tbody>
    <tr>
      <th>${i}</th>
      <td>${fournisseur.nom}</td>
      <td>${fournisseur.localisation}</td>
      <td>${fournisseur.tva}</td>
      <td>${montant[indexMontant]} wei</td>
      <td>${rangRelatif}</td>`


    }
  doc = document.createElement("div");
          doc.innerHTML = tableauDesBonsDetails;
          f.appendChild(doc);
          document.getElementById("tableauDesBonsDetails").innerHTML = "";
          document.getElementById("tableauDesBonsDetails").appendChild(f);
}


async function burn(indexB, numBon){
  dapp.coc.on("PayOff", () => {
    iframe.style.display = "none";
    alert("Bon remboursé.");
    afficherBons(index);
  });
  if (confirm("Voulez-vous vous faire rembourser votre bon de " + montant[indexB] + " wei ?")){
    let remboursement = await dapp.coc.burn(dapp.user, indexB, numBon);
    console.log(remboursement);
    patientez();

  } else {
      alert("Operation abandonnée")
      return
  }
}

function patientez(){
  iframe = document.createElement('iframe');
  iframe.id = "loading"
  iframe.src = "https://giphy.com/gifs/iLuuWPPytEZqM/html5";
  document.body.appendChild(iframe);
}

function enDev(){
  alert("Section en développement. En attendez, allez sur https://ecole.alyra.fr/mod/book/view.php?id=188&chapterid=59")
}