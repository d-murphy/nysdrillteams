import express from 'express'; 
import dotenv from 'dotenv'; 
import fs from 'fs'; 
const cors = require("cors"); 
import http from 'http'; 
import https from 'https'; 

import { getDbPromise } from './library/db';
import { runsRouter } from './services/controllers/runsControllers';
import { teamsRouter } from './services/controllers/teamsController';
import { tournamentsRouter } from './services/controllers/tournamentsController';
import { tracksRouter } from './services/controllers/tracksController'; 
import { runsDbFactory } from './services/database/runsDb';
import { teamsDbFactory } from './services/database/teamsDb';
import { tournamentsDbFactory } from './services/database/tournamentsDb';
import { tracksDbFactory } from './services/database/tracksDb';

dotenv.config(); 
let { PORT, DB_NAME, dbUn, dbPass, keyLocation, certLocation  } = process.env; 

if(!DB_NAME) DB_NAME = 'nysdrillteams'; 
const dbConnectionStr:string =
  `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;
const dbPromise = getDbPromise(dbConnectionStr, DB_NAME);

var privateKey, certificate; 
if(keyLocation) privateKey  = fs.readFileSync(keyLocation, 'utf8');
if(certLocation) certificate = fs.readFileSync(certLocation, 'utf8');
var credentials = {key: privateKey, cert: certificate};

(async function(){
    const app = express();
    app.use((req,res,next) => {
	    console.log('req here')
    next(); 
    })
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());
    app.use(cors()); 
    app.options('*', cors());    
    app.use(express.static("static/user"))
    
    
    let runsData = await runsDbFactory(dbPromise, 'runs');  
    let teamsData = await teamsDbFactory(dbPromise, 'teams'); 
    let tournamentsData = await tournamentsDbFactory(dbPromise, 'tournaments'); 
    let tracksData = await tracksDbFactory(dbPromise, 'tracks'); 
    if(runsData) app.use('/runs', runsRouter(runsData)); 
    if(teamsData) app.use('/teams', teamsRouter(teamsData));
    if(tournamentsData) app.use('/tournaments', tournamentsRouter(tournamentsData));  
    if(tracksData) app.use('/tracks', tracksRouter(tracksData));  

    app.get('/test', (req, res) =>  {
	   console.log('test hit'); 
	    res.status(200).send('hi')
    })
    
    let server = (keyLocation && certLocation) ? 
        https.createServer(credentials, app) : 
        http.createServer(app); 

    server.listen(PORT, () => {
        console.log(`Server up on ${keyLocation && certLocation ? 'https' : 'http'}`)
    })
})(); 
