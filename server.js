const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db/pharmacies');
const formidable = require('express-formidable');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const fse = require('fs-extra');
const stream = require('stream');
const mime = require('mime');
const crypto = require('crypto');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './imgs/ords/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+"-"+file.originalname) //Appending .jpg
  }
})

var upload = multer({ storage: storage })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true}));

//images
app.use(express.static('imgs'))
app.use(express.static('imgs/ords'))

//poster une nouvelle commande
app.post('/commandes/new' ,upload.single('image'),  async (req, res) =>{
    console.log(req.file)
    //const body = req.body
    //const result = await db.addCommandes(req.file.path, Date.now(),"lancée",parseInt(body.id_client) ,parseInt(body.id_pharmacy)  )
    //res.send(result)
    // var filePath = __dirname + '/imgs/ords/commande.jpg';
    //  fs.appendFile(filePath, req.file, function () {
    //    res.end('file uploaded');
    //  })
    //const results = await db.addCommandes(req.body.date_commande , req.body.etat , req.body.id_client , req.body.id_pharmacy );
    //res.status(201).send({"id" : 2})
    //res.status(201)
    res.send("uploaded image")
});


// retourne toutes les pharmacies
app.get('/pharmacies' , async (req, res) =>{
    const results = await db.getAllPharmacies();    
    res.status(201).send(results)
});

// retourne la pharmacie avec id = :id
app.get('/pharmacies/:id_pharmacy' , async (req, res) =>{
    const results = await db.getPharmacie(req.params.id_pharmacy);
    // var file = __dirname +`/imgs/img${req.params.id_pharmacy}.jpg`
    // res.sendFile(file)
    res.status(201).send(results[0])
});

app.get('/pharmacies/:id/horaires' , async (req, res) =>{
    const results = await db.getPharmacieHoraires(req.params.id);
    res.status(201).send(results)
});

app.get('/pharmacies/:id/Informations' , async (req, res) =>{
    const results = await db.getPharmacieInformations(req.params.id);
    res.status(201).send(results)
});



// retourne toutes les pharmacies dans la ville = :ville
app.get('/:ville' , async (req, res) =>{

    const results = await db.getVillePharmacies(req.params.ville);
    res.status(201).send(results)
});

// retourne toutes les commandes d'un client
app.get('/commandes/:id_client' , async (req, res) =>{

    const results = await db.getCommandes(req.params.id_client);
    res.status(201).send(results)
});

// retourne toutes les traitements d'un client
app.get('/traitements/:id_client' , async (req, res) =>{

    const results = await db.getTraitements(req.params.id_client);
    
    const resultfinale = JSONFormatting(results)
    res.status(201).send(resultfinale)
});


app.post('/users/connexion', async(req , res) =>{
    console.log("here")
    const emailHash = req.body.emailHash
    const passwordHash = req.body.passwordHash

    let result = await db.getClient(emailHash,passwordHash);
    if(result.length == 0 ){
        //result = {"id_client" : -1}
        result.push(-1)
    }else{
        //result = {"id_client" : result[0].id_client}
        let i = result[0].id_client
        result =[]
        result.push(i)
    }
    res.status(201).send(result)
})

app.post('/users/new', async(req , res) =>{
    console.log("here")
    const emailHash = req.body.emailHash
    const passwordHash = req.body.passwordHash

    // verify user is not already signe in
    const clients = await db.getClient2(emailHash)
    if(clients.length != 0) return res.status(201).send([-1])

    // add as new client
    let result = await db.addClient(emailHash,passwordHash);
   

    //result = {"id_client" : result[0]}
    res.status(201).send(result)

})

app.get('/test' , (req,res) =>{
    res.status(200).json({succes : true});
});

app.get('/' , (req,res) =>{
    res.status(200).json({succes : true}).send("Pharmacy app API");
});

app.listen(process.env.PORT || 3000, () =>{ console.log("server is running on port 3000")});





function JSONFormatting(results){

    const traitementsIDs = []

    results.forEach(resu =>{
        if(!traitementsIDs.includes(resu.id_traitement)){
            traitementsIDs.push(resu.id_traitement)
        }
    })
    const resultfinale = []
    traitementsIDs.forEach(t_id =>{
        const meds = []
        let trait = null
        results.forEach(resu2 =>{
            if(resu2.id_traitement == t_id){
                meds.push({"medicament" : `${resu2.medicament}` , "quantite" : `${resu2.quantite}`})
                trait = resu2
            }
        })
        if(meds.length != 0){
            const obj = {
            "id_client" : trait.id_client,
            "id_traitement":trait.id_traitement,
            "date_debut":trait.date_debut ,
            "duree" :trait.duree ,
            "medicaments" :meds }

            resultfinale.push(obj)
        }
    })
    return resultfinale
}


