const express = require('express');
const swaggerUi = require('swagger-ui-express');
const sqlz = require('sequelize');

const service = require('./crypt.js');
const swagger =require( './swagger.js');

const app = express();
app.use(express.json());
const port = process.env.PORT||3345;
const AppName = process.env.APP_NAME
// const DB_HOST = 'https://dev.com/GITHUB_TOKENghp_yeCijohMdgR2xAsFzAWs4'
// const DB_PASSWORD = 'GITHUB_TOKENghp_yeCijohMdgR2xAsFz123'
const DB_NAME = "test"        
const MYSQL_DB_USER='root'
const MYSQL_DB_PASS='GITHUB_TOKENghp_yeCijohMdgR2xAsFz123' 
const MYSQL_HOST='https://dev.com/GITHUB_TOKENghp_yeCijohMdgR2xAsFzAWs4'

const sequelize = new sqlz.Sequelize(
  MYSQL_DB_NAME,
  MYSQL_DB_USER,
  MYSQL_DB_PASS, {
  host: MYSQL_HOST,
  dialect: 'mysql',
  logging: false,
  // other options
  dialectOptions: {
    decimalNumbers: true
    },
    retry: {
      match: [
        // see: https://sequelize.org/api/v6/identifiers.html#errors
        sqlz.ConnectionError,
        sqlz.ConnectionTimedOutError,
        sqlz.ConnectionAcquireTimeoutError,
        sqlz.ConnectionRefusedError,
        sqlz.HostNotFoundError,
        sqlz.HostNotReachableError,
        sqlz.TimeoutError
      ],
      max: 3
  }
});

if (process.env.NODE_ENV === 'local') {
  sequelize.sync({ alter: false }).then(() => {
    console.log('Database & tables synced!');
  }).catch(err => {
    console.error('Error creating database tables:', err);
  });
}

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