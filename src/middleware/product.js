import { getAPIRequest } from "../controller/axios.js";

export const productbyid = async (request, reply) => {
  //->   /product/:id

  try {
    let searchDetails = JSON.parse(atob(request.body.data)),
      id = searchDetails.id,
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms",
        },
        params: {
          "searchCriteria[filterGroups][0][filters][0][field]": "sku",
          "searchCriteria[filterGroups][0][filters][0][condition_type]": "eq",
          "searchCriteria[filterGroups][0][filters][0][value]": id,
        },
      },
      url = process.env.MAGENTO_BASE_URL + "/rest/default/V1/products",
      response;

    response = await getAPIRequest(url, config);

    // Process the response as needed
    reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error.message });
  }
};
