import { postAPIRequest } from "../controller/axios.js";

export const customer = async (request, reply) => {
  try {
    let bearerHeader = JSON.parse(request.cookies.session),
      userDetails = JSON.parse(atob(request.body.data)),
      url =
        "https://online.apollopharmacy.org/MAPPSUAT/apollompos/Self/CUSTOMERVENDORSEARCH",
      response;
    userDetails.vendor = bearerHeader.vendorName;
    response = await postAPIRequest(url, userDetails);
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const customerSearch = async (request, reply) => {
  //->  /search_customer/
  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      url =
        "https://online.apollopharmacy.org/MAPPSUAT/apollompos/Self/SEARCHCUSTOMER",
      response,
      bearerHeader;
    if (Object.keys(request.cookies).length !== 0) {
      bearerHeader = JSON.parse(request.cookies.session);
      userDetails.CUSTOMERMOBILENUMBER = bearerHeader.user;
    }
    response = await postAPIRequest(url, userDetails);
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};
