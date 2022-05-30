const dotenv = require('dotenv'); 
dotenv.config(); 
const { PORT } = process.env; 

import express, {Request, Response} from 'express'; 

const runsRouter = require('./services/controllers/runsControllers')

const app = express();

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use('/runs', runsRouter); 




app.listen(PORT, () => {
    console.log('server up')
})