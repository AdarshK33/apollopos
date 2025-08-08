import { login, vendorSearch } from "../middleware/login.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middleware/jwt.js";
import {
  search,
  searchElastic,
  updateSearchHistory,
} from "../middleware/search.js";
import { productbyid } from "../middleware/product.js";
import { customer, customerSearch } from "../middleware/customer.js";
import {
  orderFilterAPI,
  cancelOrders,
  ordersWithMobile,
  orderwithCustomerPhone,
  createOrder,
  prescriptionOrder,
  chronicsalesdetails,
  orderHistory,
  qrinvoiceDetails,
} from "../middleware/order.js";
import {
  storesDetails,
  pincodeDetails,
  couponValidator,
} from "../middleware/store.js";
import { updatePassword, ssoVerify } from "../middleware/login.js";
import { sendOtp, VerifyOtp } from "../middleware/sendOtp.js";
import { findVendor } from "./findvendor.js";
import { location } from "../middleware/location.js";
import { validator } from "../middleware/validator.js";
import Joi from "joi";

const loginRequestBodySchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
  key: Joi.number().integer().required(),
});

export const loginUser = async (request, reply) => {
  try {
    const requestBody = JSON.parse(atob(request.body.data));
    //validate the body
    const error = await validator(
      request,
      reply,
      requestBody,
      loginRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }

    let userDetails,
      customerGroupId = 0,
      response,
      vendorData,
      accessToken,
      refreshToken,
      vendor = 0,
      session;
    reply.clearCookie("session", { path: "/" });
    // Calling the login API
    response = await login(request, reply);

    if (response.status == true) {
      // Calling the vendorSearch API
      vendorData = await vendorSearch(request, response);

      if (vendorData.items.length) {
        customerGroupId = vendorData.items[0].id;

        // Decrypt the user data
        userDetails = JSON.parse(atob(request.body.data));

        // Generate access and refresh tokens
        accessToken = await generateAccessToken({
          userName: userDetails.email,
          vendorName: response.DeviceDetails.VENDORNAME,
        });
        refreshToken = await generateRefreshToken({
          userName: userDetails.email,
          vendorName: response.DeviceDetails.VENDORNAME,
        });

        vendor = await findVendor(response.DeviceDetails.VENDORNAME);
        session = {
          SSID: accessToken,
          SRID: refreshToken,
          VID: customerGroupId,
          roleId: vendor[0].id,
          vendorName: response.DeviceDetails.VENDORNAME,
          user: userDetails.email,
        };

        // Set access and refresh tokens in cookies
        // reply
        reply
          .setCookie("session", JSON.stringify(session), {
            sameSite: "none",
            httpOnly: true,
            secure: true,
            path: "/",
          })
          .status(200)
          .send({
            success: true,
            user: response.DeviceDetails,
            usersToken: response.APIS,
            vendorId: customerGroupId,
          });
      }
    } else {
      reply.status(400).send({
        success: false,
        message: "Login failed. Please check your username and password.",
      });
    }
  } catch (error) {
    reply.status(500).send({ status: false, message: "Internal server error" });
  }
};

export const allApiCall = async (request, reply, api) => {
  try {
    switch (api.name) {
      case "search":
        await search(request, reply);
        break;
      case "searchElastic":
        await searchElastic(request, reply);
        break;
      case "sendOtp":
        await sendOtp(request, reply);
        break;
      case "VerifyOtp":
        await VerifyOtp(request, reply);
        break;
      case "customerSearch":
        await customerSearch(request, reply);
        break;
      case "updatePassword":
        await updatePassword(request, reply);
        break;
      case "autoLogin":
        await autoLogin(request, reply);
        break;
      case "customer":
        await customer(request, reply);
        break;
      case "storesDetails":
        await storesDetails(request, reply);
        break;
      case "productbyid":
        await productbyid(request, reply);
        break;
      case "couponValidator":
        await couponValidator(request, reply);
        break;
      case `pincodeDetails`:
        await pincodeDetails(request, reply);
        break;
      case "createOrder":
        await createOrder(request, reply);
        break;
      case "prescriptionOrder":
        await prescriptionOrder(request, reply);
        break;
      case "chronicsalesdetails":
        await chronicsalesdetails(request, reply);
        break;
      case "orderHistory":
        await orderHistory(request, reply);
        break;
      case "cancelOrders":
        await cancelOrders(request, reply);
        break;
      case "orderwithCustomerPhone":
        await orderwithCustomerPhone(request, reply);
        break;
      case "ordersWithMobile":
        await ordersWithMobile(request, reply);
        break;
      case "ssoVerify":
        await ssoVerify(request, reply);
        break;
      case "location":
        await location(request, reply);
        break;
      case "orderhistorypos":
        await orderFilterAPI(request, reply);
        break;
      case "postSearchHistory":
        await updateSearchHistory(request, reply);
        break;
      case "qr Invoice Details":
        await qrinvoiceDetails(request, reply);
        break;
    }
  } catch (error) {
    reply.status(500).send({ status: false, message: "Internal server error" });
  }
};
