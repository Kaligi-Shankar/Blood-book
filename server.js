const express = require('express'); //import express
const mongoose = require('mongoose'); //import mongoose
const RegisteredUser = require('./model') // importing models from mongoose schema
const jwt = require('jsonwebtoken'); //importing jsonwebtoken
const middleware = require('./Middleware'); //using middleware
const cors = require('cors'); //this is to accept requests from any server
const app = express(); //assigning to application
const port = 8000;
const ipAddress = '192.168.109.161'

mongoose.connect('mongodb+srv://shankarkaligi20:mebook@cluster0.e8krplq.mongodb.net/', {
    useNewUrlParser: true,
  useUnifiedTopology: true,
  tlsAllowInvalidCertificates: true,
})
.then(() => console.log('Mongo DB Connected'))
    .catch((err) => console.log(err)); //connect to Mongo

app.get('/', (req, res) => {
    res.send('Welcome')
})

app.use(express.json());    // while signup or login we need to send in json
app.use(cors({origin: "*",
methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',}))

// Sign up Route
app.post('/signup', async (req, res) => {
    try{
        const {username, email, password, confirmpassword} = req.body;
        let exist= await RegisteredUser.findOne({email: email});
        if(exist) {
            return res.status(400).send(' User already registered. please login')
        }
        if(password !== confirmpassword){
            return res.status(400).send('passwords are not matching')
        }
        let newUser = new RegisteredUser({
            username,
            email,
            password,
            confirmpassword
        })
        await newUser.save();
        res.status(200).send('user registered successfully')
    }
    catch(err){ 
        console.log(err)
    return res.status(500).send('Internal Server Error');
    }
})
//Login Route
app.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body
        let exist = await RegisteredUser.findOne({email: email});
        if(!exist){
            return res.status(400).send('user not found. please register')
        }
        if(exist.password !== password){
            return res.status(400).send('password is incorrect. please try again')
        }
        let payload = {
            user: {
                id: exist.id
            }
        }
        jwt.sign(payload, 'jwt key', {expiresIn: 3600000}, (err, token)=>{
            if(err) throw err;
            return res.json({token})
        })

    }catch(err){
        console.log(err)
        return res.status(500).send('internal server error')
    }
})

app.get('/myprofile', middleware, async(req, res)=>{
    try{
        let exist = await RegisteredUser.findById(req.user.id);
        if(!exist){
        return res.status(404).send('user not found');
        }
        res.json(exist);
    }
    catch(err){
        console.log(err)
        return res.status(500).send('internal server error')
    }
})
//listening server when called
// app.listen(8000, () =>{
// console.log('server listening on 8000');
// })
app.listen(port, ipAddress, () => {
    console.log(`Server is running at http://${ipAddress}:${port}`);
  });