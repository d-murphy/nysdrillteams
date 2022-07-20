const dotenv = require('dotenv'); 
dotenv.config(); 
let { PORT, DB_NAME, dbUn, dbPass } = process.env; 
if(!DB_NAME) DB_NAME = 'nysdrillteams'; 

const cors = require("cors")

import express, {Request, Response} from 'express'; 
import { getDbPromise, getCollectionPromise } from './services/database/db';
import { runsRouter } from './services/controllers/runsControllers';
import runsData from './services/database/runsMock'; 

const dbConnectionStr:string =
  `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;
const dbPromise = getDbPromise(dbConnectionStr, DB_NAME);
// const collectionPromise = getCollectionPromise(dbPromise, 'test')


// const teamsRouter = require('./services/controllers/teamsController')
// const tracksRouter = require('./services/controllers/tracksController')
// const tournamentsRouter = require('./services/controllers/tournamentsController')



const app = express();

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cors()); 

app.use(express.static("static/user"))



app.use('/runs', runsRouter(dbPromise, 'runs', runsData)); 


// app.use('/teams', teamsRouter);
// app.use('/tracks', tracksRouter);
// app.use('/tournaments', tournamentsRouter); 

// app.get('/test', async (req,res) => {
//     // let db = await dbFetch(DB_NAME)
//     // let result = await db.collection('test').findOne(); 
//     // console.log(result);
//     res.status(200).send('hiii'); 
// })

(async function(){
    if(!DB_NAME) return 
    // let collection = await collectionPromise; 
    console.log(await collection?.findOne()) 
    app.listen(PORT, () => {
        console.log('server up')
    })
})()