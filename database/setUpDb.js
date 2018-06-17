/**
 * @Author Ritesh
 * @Date 6/16/2018
 * @Description: Setup the postgres database
 */

const { Pool } = require('pg');

class database {

    constructor(){
        if(this.instance){
            throw new Error("can create a new instance, use 'getInstance' method")
        }
        this.pool;
    }

    connect(){
        console.log(process.env.PGUSERNAME, process.env.HOST, process.env.DATABASENAME,process.env.PGPORT)
        this.pool = new Pool ({
            user: process.env.PGUSERNAME,
            host: process.env.HOST,
            database: process.env.DATABASENAME,
            password: process.env.PASSWORD,
            port: process.env.PGPORT || 5432,
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