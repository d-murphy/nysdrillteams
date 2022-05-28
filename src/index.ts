const dotenv = require('dotenv'); 
dotenv.config(); 
const { PORT } = process.env; 

import express, {Request, Response} from 'express'; 
const bodyParser = require('body-parser');

const runsRouter = require('./services/controllers/runsControllers')

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/runs', runsRouter); 


app.listen(PORT, () => {
    console.log('server up')
})