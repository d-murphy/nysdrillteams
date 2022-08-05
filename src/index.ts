const dotenv = require('dotenv'); 
dotenv.config(); 
let { PORT, DB_NAME, dbUn, dbPass } = process.env; 
if(!DB_NAME) DB_NAME = 'nysdrillteams'; 

const cors = require("cors")

import express from 'express'; 
import { getDbPromise } from './library/db';
import { runsRouter } from './services/controllers/runsControllers';
import { teamsRouter } from './services/controllers/teamsController';
import { tournamentsRouter } from './services/controllers/tournamentsController';
import { tracksRouter } from './services/controllers/tracksController'; 
import { runsDbFactory } from './services/database/runsDb';
import { teamsDbFactory } from './services/database/teamsDb';
import { tournamentsDbFactory } from './services/database/tournamentsDb';
import { tracksDbFactory } from './services/database/tracksDb';

const dbConnectionStr:string =
  `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;
const dbPromise = getDbPromise(dbConnectionStr, DB_NAME);

(async function(){
    const app = express();

    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());
    app.use(cors()); 
    
    app.use(express.static("static/user"))
    
    
    let runsData = await runsDbFactory(dbPromise, 'runs');  
    let teamsData = await teamsDbFactory(dbPromise, 'teams'); 
    let tournamentsData = await tournamentsDbFactory(dbPromise, 'tournaments'); 
    let tracksData = await tracksDbFactory(dbPromise, 'tracks'); 
    if(runsData) app.use('/runs', runsRouter(runsData)); 
    if(teamsData) app.use('/teams', teamsRouter(teamsData));
    if(tournamentsData) app.use('/tournaments', tournamentsRouter(tournamentsData));  
    if(tracksData) app.use('/tracks', tracksRouter(tracksData));  

    app.listen(PORT, () => {
        console.log('server up')
    })
})()