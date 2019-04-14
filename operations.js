
 
function index(){
window.location.replace('index.html');
}

async function displayToken() {
    try{
        document.getElementById("demande").innerHTML = "";
    }finally{
        console.log("refresh");
    }

    document.getElementById("demande").innerHTML = "Veuillez patienter...";
    await createMetaMaskDapp() 

    try {
    let demandes =  await dapp.marketPlace.getNbDemande();
    // create fragment
    const f = document.createDocumentFragment();
    // loop offers
    
    
        let tableau = `
            <table class="table">
           <thead class="thead-dark">
             <tr>
               <th scope="col" class="text-center">Demande #</th>
               <th scope="col" class="text-center">Description</th>
               <th scope="col" class="text-center">Reputation minimum</th>
               <th scope="col" class="text-center">Remuneration (ethers)</th>
               <th scope="col" class="text-center">_____Délai_______</th>
               <th scope="col" class="text-center">Candidats en lice pour le projet</th>
               <th scope="col" class="text-center">Statut</th>
               <th scope="col" class="text-center">Entreprise emettrice</th>
               <th scope="col" class="text-center">Illustrateur choisi par l'entreprise</th>
               <th scope="col" class="text-center">Hash de l'illustration</th>
               <th scope="col" class="text-center">___Entreprises___</th>
             </tr>
           </thead>`
           let index;
    if(demandes.length > 0) {
        for(x of demandes) {
            index = demandes.indexOf(x);
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
            document.getElementById("demande").innerHTML = "";
            document.getElementById("demande").appendChild(f);
        
        //} else {
         //   document.getElementById("demande").innerHTML = "Enregistrez votre première offre!"
            

    
    
    console.log(demandes);
    } catch (err) {
    //Gestion des erreurs
    alert(err)
    console.error(err);
    }
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