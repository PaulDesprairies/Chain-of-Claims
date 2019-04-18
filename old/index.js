

async function operations(){
    await window.location.replace('operations.html');
    alert("1");
    await load();
    alert("2");
    await afficherCarnetDeCommande();
    alert("3");
}


async function afficherCarnetDeCommande() {
    document.getElementById("carnetDeCommande").innerHTML = "Veuillez patienter...";
    const f = document.createDocumentFragment();

    try{
    
    let  BonsDeCommande = await dapp.coc.listeBons();

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


    let index;
    if(BonsDeCommande[0].length > 0) {
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


