import sql from "../../config/dbconfig.js";

export const uuidApiEndpointetails = async (id) => {

    return new Promise((resolve, reject) => {
        
        sql.query(`SELECT * FROM api WHERE uuid = ? `, [id], (err, data) => {
            if (err) return reject(err)
            resolve(data[0])
            return;
        })
    })
}