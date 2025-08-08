import sql from "../../config/dbconfig.js";

export const findVendor = (vendorName) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "SELECT * FROM `roles` WHERE `role_name` = ? ",
      [vendorName],
      (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
        return;
      }
    );
  });
};

export const searchHistory = (vendorSearchHistory) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "DELETE FROM search_history where roles_id = ? and search_product= ? and productID = ?",
      [
        vendorSearchHistory.roles_id,
        vendorSearchHistory.search_product,
        vendorSearchHistory.productID,
      ],
      (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        sql.query(
          "INSERT INTO search_history SET ?",
          [vendorSearchHistory],
          (err, res) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(res);
            return;
          }
        );
      }
    );
  });
};

export const getsearchHistory = (roles_id) => {
  return new Promise((resolve, reject) => {
    sql.query(
      "SELECT * FROM `search_history` WHERE `roles_id` = ? ORDER BY id DESC LIMIT 5;",
      [roles_id],
      (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
        return;
      }
    );
  });
};
