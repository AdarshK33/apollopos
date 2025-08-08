import axios from "axios";

export const postAPIRequest = async (url, data) => {
  // new Promise((resolve, reject) => {
  return await axios
    .post(url, data, {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.MAGENTO_TOKEN,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error.response.data);
      return error.response;
    });
};

export const postAPIRequestPlaceOrder = async (url, data) => {
  // new Promise((resolve, reject) => {
  return await axios
    .post(url, data, {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.MAGENTO_TOKEN,
    })
    .then((response) => {
      return response.data[0];
    })
    .catch((error) => {
      console.log(error.response.data);
      return error.response;
    });
};

export const getAPIRequest = async (url, header) => {
  return await axios
    .get(url, header)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

export const localtionAPI = async (url, header) => {
  return await axios
    .get(url, header)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

export const postAPIwithheader = async (url, data, header) => {
  // let data = JSON.stringify(data);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: header,
    data: JSON.stringify(data),
  };

  return axios
    .request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

export const postAPIwithheaderqr = async (data) => {
  // let data = JSON.stringify(data);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: process.env.MAGENTO_BASE_URL + "/rest/V1/servicability/getid/",
    headers: {
      "Content-Type": "application/json",
      Cookie: "PHPSESSID=3731jua2i579m07q1uhbcr8bi0",
    },
    data: JSON.stringify(data),
  };

  return axios
    .request(config)
    .then((response) => {
      return response.data[0].product_id;
    })
    .catch((error) => {
      return error;
    });
};
