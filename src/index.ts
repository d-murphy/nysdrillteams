const dotenv = require('dotenv'); 
dotenv.config(); 
let { PORT, DB_NAME, dbUn, dbPass } = process.env; 
if(!DB_NAME) DB_NAME = 'nysdrillteams'; 

const cors = require("cors")

import express from 'express'; 
import { getDbPromise } from './services/database/db';
import { runsRouter } from './services/controllers/runsControllers';
import { runsDbFactory } from './services/database/runsDb';
// import runsData from './services/database/runsMock'

const dbConnectionStr:string =
  `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;
const dbPromise = getDbPromise(dbConnectionStr, DB_NAME);

// const teamsRouter = require('./services/controllers/teamsController')
// const tracksRouter = require('./services/controllers/tracksController')
// const tournamentsRouter = require('./services/controllers/tournamentsController')
    
// app.get('/test', async (req,res) => {
//     // let db = await dbFetch(DB_NAME)
//     // let result = await db.collection('test').findOne(); 
//     // console.log(result);
//     res.status(200).send('hiii'); 
// })

(async function(){
    const app = express();

    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());
    app.use(cors()); 
    
    app.use(express.static("static/user"))
    
    
    let runsData = await runsDbFactory(dbPromise, 'runs');  
    if(runsData) app.use('/runs', runsRouter(runsData)); 
    
    // app.use('/teams', teamsRouter);
    // app.use('/tracks', tracksRouter);
    // app.use('/tournaments', tournamentsRouter); 
    

    app.listen(PORT, () => {
        console.log('server up')
    })
})()