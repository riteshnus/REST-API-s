const { Pool } = require('pg');

class database {

    constructor(){
        if(this.instance){
            throw new Error("can create a new instance, use 'getInstance' method")
        }
        this.pool;
    }

    /*user: process.env.USERNAME,
    host: process.env.HOST,
    database: process.env.DATABASENAME,
    password: process.env.PASSWORD,
    port: process.env.PORT || 5432,*/

    connect(){
        var config = require('../config');
        this.pool = new Pool ({
            user: config.postGresDb.username,
            host: config.postGresDb.host,
            database: config.postGresDb.databaseName,
            password: config.postGresDb.password,
            port: config.postGresDb.port || 5432,
        })

        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err)
            process.exit(-1)
        })
        this.instance = new database();
        return;
    }

    query($sqlQuery,values){
        var queryPromise = new Promise( (resolve, reject) => {
            this.pool.connect()
                .then(client => {
                    return client.query($sqlQuery,values).then(data => {
                        client.release();
                        resolve(data)
                    }).catch(err => {
                        client.release();
                        reject(err);
                    });
                })
                .catch (err => {
                    reject(err);
                })
        })
        return queryPromise;
    }

    textQuery($sqlQuery){
        var queryPromise = new Promise( (resolve, reject) => {
            this.pool.connect()
                .then(client => {
                    return client.query($sqlQuery).then(data => {
                        client.release();
                        resolve(data)
                    }).catch(err => {
                        client.release();
                        reject(err);
                    });
                })
                .catch (err => {
                    reject(err);
                })
        })
        return queryPromise;
    }
}

module.exports = new database();