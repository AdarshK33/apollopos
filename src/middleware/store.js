import { postAPIRequest } from "../controller/axios.js";
import Joi from "joi";
import { validator } from "../middleware/validator.js";

const storesDetailsRequestBodySchema = Joi.object({
  pincode: Joi.string().required(),
  vendor: Joi.string().required(),
});

const pincodeDetailsRequestBodySchema = Joi.object({
  params: Joi.number().integer().required(),
});
const couponValidatorRequestBodySchema = Joi.object({
  coupon: Joi.required(),
  products: Joi.required(),
});

export const storesDetails = async (request, reply) => {
  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      url =
        process.env.MAGENTO_BASE_URL +
        "/rest/default/V1/orderpunchingapis/storesdetails",
      response,
      bearerHeader;
    //for basic Auth
    if (Object.keys(request.cookies).length !== 0) {
      bearerHeader = JSON.parse(request.cookies.session);
      userDetails.vendor = bearerHeader.user;
    }
    //validate the body
    const error = await validator(
      request,
      reply,
      userDetails,
      storesDetailsRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }

    userDetails = {
      params: userDetails,
    };
    response = await postAPIRequest(url, userDetails);
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send();
  }
};

export const pincodeDetails = async (request, reply) => {
  try {
    var pincode = JSON.parse(atob(request.body.data)),
      pincode = {
        params: pincode,
      },
      url =
        process.env.MAGENTO_BASE_URL +
        "/rest/default/V1/orderpunchingapis/pincodedetails",
      response;

    //validate the body
    const error = await validator(
      request,
      reply,
      pincode,
      pincodeDetailsRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }

    response = await postAPIRequest(url, pincode);
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send(error);
  }
};

export const couponValidator = async (request, reply) => {
  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      url =
        process.env.MAGENTO_BASE_URL +
        "/rest/default/V1/orderpunchingapis/couponvalidator",
      response;
    //validate the body
    const error = await validator(
      request,
      reply,
      userDetails,
      couponValidatorRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }

    response = await postAPIRequest(url, {
      params: userDetails,
    });
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send(error);
  }
};
