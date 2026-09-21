const express = require('express');
const swaggerUi = require('swagger-ui-express');

const service = require('./crypt.js');
const swagger =require( './swagger.js');

const app = express();
app.use(express.json());
const port = process.env.PORT||3345;
const AppName = process.env.APP_NAME
// const AppName = process.env.APP_NAME

const middleware = (req, res, next) => {
    const key = req.query['key']|| req.headers['key'];
    const iv = req.query['iv']|| req.headers['iv'];
    if (!key || !iv) {
        return res.status(400).json({status:"error",message:"Key and IV are required"});
    }
    req.keys = {key,iv};
    next();
}

app.use('/api-docs', swagger);
app.get('/', (req, res) => {
    res.status(200).json({status:"success",message:'Welcome to sir_obed encryption server!'});
    })

app.post('/encrypt',middleware, (req, res) => {
    const data = req.body;
    const encryptedData = service.encryptData(data,null,req.keys);
    res.status(200).json({status:"success",message:encryptedData})
}
)

app.post('/decrypt',middleware, async(req, res) => {
   try {
    const data = req.body;
    if (!data.data && !data.encryptedText) {
       return  res.status(400).json({status:"error",message:"Data to decrypt is required"});
    }
    const decryptedData = service.decryptData(data,req.keys);
    if(!decryptedData){
        return res.status(400).json({status:"error",message:"invalid parameters for decryption"})
    }

    res.status(200).json({status:"success",decryptedData:decryptedData})
   } catch (error) {
    return res.status(400).json({status:"error",message:"invalid key and iv parameters for decryption"})
   }

}
)

app.listen(port, () => {
    console.log(`http://localhost:${port}/api-docs`);
    }
)