const dotenv = require('dotenv'); 
dotenv.config(); 
const { PORT } = process.env; 
const cors = require("cors")

import express, {Request, Response} from 'express'; 

const runsRouter = require('./services/controllers/runsControllers')
const teamsRouter = require('./services/controllers/teamsController')
const tracksRouter = require('./services/controllers/tracksController')
const tournamentsRouter = require('./services/controllers/tournamentsController')


const app = express();

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cors()); 

app.use('/runs', runsRouter); 
app.use('/teams', teamsRouter);
app.use('/tracks', tracksRouter);
app.use('/tournaments', tournamentsRouter); 


app.listen(PORT, () => {
    console.log('server up')
})