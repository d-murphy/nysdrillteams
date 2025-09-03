import express from 'express'; 
import dotenv from 'dotenv'; 
import fs from 'fs'; 
const cors = require("cors")
import http from 'http'; 
import https from 'https'; 
require('express-async-errors');

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
import { projectionDbFactory } from './services/database/projectionDb';
import { simContSumDbFactory } from './services/database/simContSumDb';
import SessionAdmin from './services/dataService/session'; 
import { announcementRouter } from './services/controllers/announcementsController';
import { historyDbFactory } from './services/database/historyDb';
import { historiesRouter } from './services/controllers/historiesController'; 
import { makeImageMethods, makeImageS3Methods } from './services/database/imageDb';
import { makeImagesRouter } from './services/controllers/imageController';

import { s3Client } from './components/images'; 
import { s3BucketName } from './components/importedEnv'; 
import { projectionRouter } from './services/controllers/projectionController';
import { simContSumRouter } from './services/controllers/simContSumController';

dotenv.config(); 
let { PORT, DB_NAME, dbUn, dbPass, keyLocation, certLocation } = process.env; 

if(!DB_NAME) DB_NAME = 'nysdrillteams'; 
const dbConnectionStr:string =
  `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;
const dbPromise = getDbPromise(dbConnectionStr, DB_NAME);

var privateKey, certificate; 
if(keyLocation) privateKey = fs.readFileSync(keyLocation, 'utf8'); 
if(certLocation) certificate = fs.readFileSync(certLocation, 'utf8'); 
var credentials = {key: privateKey, cert: certificate}; 

(async function(){
    const app = express();
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());
    app.use(cors()); 
    app.options('*', cors());
    app.use(express.static("static/user"))
    app.use((req,res,next) => {
        next(); 
    })
    
    const sessionAdmin = new SessionAdmin(); 

    let s3Methods = await makeImageS3Methods(s3Client, s3BucketName);
    let imageMethods = await makeImageMethods(dbPromise, 'track-images', s3Methods, s3BucketName);
    
    let runsData = await runsDbFactory(dbPromise, 'runs');  
    let teamsData = await teamsDbFactory(dbPromise, 'teams', 'similarTeamsDist'); 
    let tournamentsData = await tournamentsDbFactory(dbPromise, 'tournaments', 'idTracker'); 
    let tracksData = await tracksDbFactory(dbPromise, 'tracks'); 
    let usersData = await usersDbFactory(dbPromise, 'users'); 
    let updatesData = await updatesDbFactory(dbPromise, 'updates'); 
    let historyData = await historyDbFactory(dbPromise, 'team-histories'); 
    let projectionData = await projectionDbFactory(dbPromise, 'simulation-projections'); 
    let simContSumData = await simContSumDbFactory(dbPromise, 'simulation-contest-summary'); 
    if(runsData) app.use('/runs', runsRouter(runsData, sessionAdmin)); 
    if(teamsData) app.use('/teams', teamsRouter(teamsData, sessionAdmin));
    if(tournamentsData) app.use('/tournaments', tournamentsRouter(tournamentsData, sessionAdmin));  
    if(tracksData) app.use('/tracks', tracksRouter(tracksData, sessionAdmin));  
    if(usersData) app.use('/users', usersRouter(usersData, sessionAdmin))
    if(updatesData) app.use('/updates', updatesRouter(updatesData, sessionAdmin))
    if(historyData && runsData && teamsData && tournamentsData) app.use('/histories', historiesRouter(historyData, runsData, tournamentsData, teamsData, sessionAdmin)); 
    if(imageMethods) app.use('/images', makeImagesRouter(imageMethods, sessionAdmin))
    if(projectionData) app.use('/projections', projectionRouter(projectionData))
    if(simContSumData) app.use('/simContSum', simContSumRouter(simContSumData))

    app.use("/announcements", announcementRouter(sessionAdmin))

    app.get('/test', (req, res) => res.status(200).send('hi'))

    let server = (keyLocation && certLocation) ? 
        https.createServer(credentials, app) : 
        http.createServer(app); 
    
    server.listen(PORT, () => {
        console.log(`Server up on ${keyLocation && certLocation ? 'https' : 'http'}`)
    })
})(); 
