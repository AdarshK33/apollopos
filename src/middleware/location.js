import { localtionAPI } from "../controller/axios.js";

export const location = async (request, reply) => {
  //->  /location/

  try {
    let searchDetails = JSON.parse(atob(request.body.data)),
      config = {
        headers: {
          "Content-Type": "application/json",
        },
      },
      url =
        process.env.GOOGLE_API +
        "?address=" +
        searchDetails.address +
        "&key=" +
        process.env.GOOGLE_API_KEY,
      response;

    response = await localtionAPI(url, config);

    // Process the response as needed
    reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};
