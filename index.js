const express = require('express');
const session = require('express-session')
const bodyparser = require('body-parser');
const conn = require('./controllers/db');
const { admin_auth, ass_auth } = require('./controllers/auth');

const app = express();

app.use(session({
    secret: 'sessionsecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        sameSite: 'strict',
        httpOnly: true,
    }
}));
app.use('/public', express.static('public'));
app.use(bodyparser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', (req, res) =>{
    res.render('index');
})

app.get('/login', (req, res) =>{
    res.render('login');
})

app.post('/loginPost', (req, res) =>{
    let { login_number, password } = req.body;
    let sql = "SELECT*FROM assureur where numero = ? and mot_de_passe = ?";
    conn.query(sql, [login_number, password], (err, result) =>{
        if(err){
            console.log(err)
            res.send('internal server error: '+err)
        }
        else{
            if(result.length === 0){
                return res.send('parametres incorrects')
            }
            if(result[0].role_ === 1){
                req.session.role = 1
                return res.redirect('/administrateur')
            }
            req.session.role = 2
            req.session.loc = result[0].succursale
            req.session.a_id = result[0].assureur_id
            res.redirect('/assureur')
        }
    })
})

app.get('/administrateur', admin_auth, (req, res) =>{
    res.render('administrateur');
})

app.get('/assureur', ass_auth, (req, res) =>{
    let a = req.session.loc;
    let b =req.session.a_id;
    let sql = "SELECT*FROM client WHERE lieu = ?"
    conn.query(sql, a, (err,result) =>{
        if(err){
            console.log(err)
            return res.send('internal server error: '+err)
        }
        let unassured = result.filter(obj => obj.assure === 1)
        let assured = result.filter(obj => obj.assure > 1)
        res.render('assureur', { a, b, unassured, assured });
    })
})

app.post('/ajouterclient', ass_auth, (req, res)=>{
    let { nom_client, num, lieu } = req.body
    let sql = "INSERT INTO client SET ?";
    const data = {
        nom: nom_client, 
        numero_tel: num, 
        lieu: lieu, 
      };
    conn.query(sql, data, (err, result) =>{
        if(err){
            console.log(err)
            res.send('internal server error: '+err)
        }
        else{
            res.redirect('/assureur')
        }
    })
})

app.post('/ajouterassurance', ass_auth, (req, res) =>{
    let { duree, montant, type, clientID, assureurID } = req.body
    const data = {
        assureur: assureurID, 
        client: clientID, 
        duree: duree,
        montant: montant,
        type: type 
    };
    let sql = "INSERT INTO assurance SET ?"
    conn.query(sql, data, (err, result) =>{
        if(err){
            console.log(err)
            res.send('internal server error: '+err)
        }
        else{
            conn.query("UPDATE client SET assure = 2 WHERE client_id = ?", clientID, (error, results) =>{
                if(error){
                    console.log(error)
                    res.send('internal server error: '+error)
                }else{
                    res.redirect('/assureur')
                }
            })
        }
    })

})

app.post('/supprimer', ass_auth, (req, res) =>{
    let client_id = req.body.client_id
    let sql = "DELETE FROM client WHERE client_id = ?"
    conn.query(sql, client_id, (err, result) =>{
        if(err){
            console.log(err)
            res.send('internal server error: '+err)
        }else{
            res.redirect('/assureur')
        }
    })
})

app.get('*', (req, res) => {
    res.render('404')
});
app.listen(3000, ()=>{ console.log('server running at http://localhost:3000')});