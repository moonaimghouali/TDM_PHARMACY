const knex = require("./knex");


//working
function getAllPharmacies() {
    return knex("Pharmacy").select("id_pharmacy", "nom", "ville", "adress", "latitude", "longtitude", "num_tel");
}

function getAllPharmaciesImages() {
    return knex("Pharmacy").select("photo");
}

//not working
function getPharmacie(id_pharmacy) {
    return knex("Pharmacy")
    .select("id_pharmacy","nom","ville","adress", "latitude" , "longtitude","num_tel" ,"url_fb" )
    .where("id_pharmacy", id_pharmacy);
}

function getPharmacieHoraires(id) {
    return knex("Horraire")
    .select("jour","heure_ouverture", "heure_fermeture")
    .where("id_pharmacy", id);
}

function getPharmacieInformations(id) {
    return knex("Information")
    .join('Pharmacy_Informations','Information.id_information','=', 'Pharmacy_Informations.id_information')
    .join('Pharmacy', 'Pharmacy_Informations.id_pharmacy', '=', 'Pharmacy.id_pharmacy')
    .select("Information.id_information","Information.info_title","Information.info_detail")
    
    .where("Pharmacy.id_pharmacy", id);
}


//working
function getVillePharmacies(ville) {
    return knex("Pharmacy").select("id_pharmacy", "nom", "ville", "adress", "latitude", "longtitude",  "num_tel", "url_fb")
        .where("ville", ville);
}

//working
function getCommandes(id_client) {
    return knex("Commande")
    .join('Pharmacy', 'Commande.id_pharmacy', '=', 'Pharmacy.id_pharmacy')
    .select("Commande.id_client","Commande.id_commande","Pharmacy.id_pharmacy","Commande.date_commande","Commande.etat" , "Pharmacy.nom")
    .where("id_client", id_client);
}

function addCommandes( img_path, date_commande , etat, id_client, id_pharmacy) {
    return knex("Commande")
    .insert({
        ordonance : img_path,
        date_commande :date_commande ,
        etat : etat,
        id_client : id_client,
        id_pharmacy : id_pharmacy,
    })
    ;
}

//semi working
function getTraitements(id_client) {
    return knex.select('Traitement.id_client','Traitement.id_traitement','Traitement.date_debut','Traitement.duree','Medicament.medicament','Medicament.quantite').from("Traitement")
        .leftJoin('Medicament', 'Traitement.id_traitement', 'Medicament.id_traitement')
        .where("Traitement.id_client", id_client);
}

function getClient(emailHash , passwordHash){
     return knex.select("id_client")
    .from("Client")
    .where({"email": emailHash, "password":  passwordHash });
}

function getClient2(emailHash){
     return knex.select("id_client")
    .from("Client")
    .where({"email": emailHash});
}

function addClient(emailHash , passwordHash){
     return knex("Client")
    .insert({
        email : emailHash,
        password :passwordHash 
    })
    ;
}


module.exports = {
    getAllPharmacies,
    getAllPharmaciesImages,
    getVillePharmacies,
    getPharmacie,
    getPharmacieHoraires,
    getPharmacieInformations,
    getCommandes,
    addCommandes,
    getTraitements,
    getClient,
    getClient2,
    addClient
}