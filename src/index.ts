import express from 'express'; 
import { getDbPromise } from './library/db';
import { runsRouter } from './services/controllers/runsControllers';
import { teamsRouter } from './services/controllers/teamsController';
import { tournamentsRouter } from './services/controllers/tournamentsController';
import { tracksRouter } from './services/controllers/tracksController'; 
import { usersRouter } from './services/controllers/usersController';
import { updatesRouter } from './services/controllers/updatesController'; 
import { runsDbFactory } from './services/database/runsDb';
import { teamsDbFactory } from './services/database/teamsDb';
import { tournamentsDbFactory } from './services/database/tournamentsDb';
import { tracksDbFactory } from './services/database/tracksDb';
import { usersDbFactory } from './services/database/usersDb';
import { updatesDbFactory } from './services/database/updatesDb';
import SessionAdmin from './services/dataService/session'; 
import { announcementRouter } from './services/controllers/announcementsController';

const cors = require("cors")
require('express-async-errors');
const dotenv = require('dotenv'); 
dotenv.config(); 

let { PORT, DB_NAME, dbUn, dbPass } = process.env; 
if(!DB_NAME) DB_NAME = 'nysdrillteams'; 

const dbConnectionStr:string =
  `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;
const dbPromise = getDbPromise(dbConnectionStr, DB_NAME);

(async function(){
    const app = express();

    app.options('*', cors());
    app.use(cors()); 
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());
    
    app.use(express.static("static/user"))
    app.use((req,res,next) => {
        next(); 
    })
    
    const sessionAdmin = new SessionAdmin(); 
    
    let runsData = await runsDbFactory(dbPromise, 'runs');  
    let teamsData = await teamsDbFactory(dbPromise, 'teams'); 
    let tournamentsData = await tournamentsDbFactory(dbPromise, 'tournaments'); 
    let tracksData = await tracksDbFactory(dbPromise, 'tracks'); 
    let usersData = await usersDbFactory(dbPromise, 'users'); 
    let updatesData = await updatesDbFactory(dbPromise, 'updates'); 
    if(runsData) app.use('/runs', runsRouter(runsData, sessionAdmin)); 
    if(teamsData) app.use('/teams', teamsRouter(teamsData, sessionAdmin));
    if(tournamentsData) app.use('/tournaments', tournamentsRouter(tournamentsData, sessionAdmin));  
    if(tracksData) app.use('/tracks', tracksRouter(tracksData, sessionAdmin));  
    if(usersData) app.use('/users', usersRouter(usersData, sessionAdmin))
    if(updatesData) app.use('/updates', updatesRouter(updatesData, sessionAdmin))
    app.use("/announcements", announcementRouter(sessionAdmin))

    app.get('/test', (req, res) => res.status(200).send('hi'))
    
    app.listen(PORT, () => {
        console.log(`Server up.`)
    })
})(); 