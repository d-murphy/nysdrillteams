const dotenv = require('dotenv'); 
dotenv.config(); 
const { PORT } = process.env; 


import express, {Express, Request, Response} from 'express'; 

const app = express(); 

app.get('/', (req: Request, res: Response) => {
    res.send('hello world!'); 
})

app.listen(PORT, () => {
    console.log('server up')
})