import { getAPIRequest, postAPIRequest } from "../controller/axios.js";
import { findVendor } from "../controller/findvendor.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middleware/jwt.js";

export const sendOtp = async (request, reply) => {
  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      url = "https://online.apollopharmacy.org/BHEL/Apollo/BHEL/ForGotPassword",
      headers = { "Content-Type": "application/json" },
      data = userDetails,
      response;

    response = await postAPIRequest(url, data, { headers });
    reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error.message });
  }
};

export const VerifyOtp = async (request, reply) => {
  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      url = `https://online.apollopharmacy.org/BHEL/Apollo/BHEL/ValidatePassword?password=${userDetails.userOTP}&encryptedpassword=${userDetails.originalOTP}`,
      headers = { "Content-Type": "application/json" },
      response,
      accessToken,
      refreshToken,
      vendor,
      session;

    response = await getAPIRequest(url);

    if (response.Message == "success") {
      // return response
      // reply.status(200).send(response)
      // Generate access and refresh tokens
      // Generate access and refresh tokens
      accessToken = await generateAccessToken({
        userName: userDetails.mobile,
        vendorName: userDetails.type,
      });
      refreshToken = await generateRefreshToken({
        userName: userDetails.email,
        vendorName: userDetails.type,
      });

      vendor = await findVendor(userDetails.type);
      session = {
        SSID: accessToken,
        SRID: refreshToken,
        VID: 9,
        roleId: vendor[0].id,
        vendorName: userDetails.type,
        user: userDetails.mobile,
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
          message: response.Message,
        });
    } else if (response.Message == "please enter correct otp") {
      // return error response
      reply.status(400).send({
        success: false,
        message: response.Message,
      });
    } else {
      // return error response
      reply.status(500).send({
        success: false,
        message: response.Message,
      });
    }
  } catch (error) {
    reply.status(500).send({ status: false, message: error.message });
  }
};
