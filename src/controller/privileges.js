import sql from "../../config/dbconfig.js";

export const privilegeDetails = (rolesId) => {

    return new Promise((resolve, reject) => {

        const query = `SELECT r.role_name, c.component_name, p.permission FROM privilege p
         JOIN roles r ON r.id = p.roles_id
         JOIN components c ON c.id = p.component_id
         WHERE p.roles_id = ?`;

         sql.query(query, [rolesId], (err, results) => {
            if (err) {
                reject(err)
                return;
            }
            resolve(results)
            return;
        })
    })

}