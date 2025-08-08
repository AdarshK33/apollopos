import { loginUser, allApiCall } from "../controller/index.js";
import { checkCookie } from "../middleware/jwt.js";
import { uuidApiEndpointetails } from "../controller/uuidDetails.js";
import { privilege, logout } from "../middleware/login.js";
import { fetchSearchHistory } from "../middleware/search.js";
import { sendOtp, VerifyOtp } from "../middleware/sendOtp.js";
import { qrinvoiceDetails } from "../middleware/order.js";

export default async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    reply.status(200).send("welcome to pos backend");
  });

  fastify.get("/:id", async function (request, reply, next) {
    const { id } = request.params;
    const api = await uuidApiEndpointetails(id);
    if (api) {
      const { status, code, message } = await checkCookie(request, reply, next);
      if (status == true) {
        switch (api.name) {
          case "privilege":
            await privilege(request, reply);
            break;
          case "getSearchHistory":
            await fetchSearchHistory(request, reply);
            break;
          case "logout":
            await logout(request, reply);
            break;
        }
      } else {
        reply.status(code).send({ status: false, message: message });
      }
    } else {
      // API not found
      reply.status(404).send({ status: false, message: "Not found" });
    }
  });

  fastify.post("/:id", async function (request, reply, next) {
    const { id } = request.params;
    const api = await uuidApiEndpointetails(id);
    request.body = JSON.parse(request.body);
    try {
      if (
        JSON.parse(atob(request.body.data)) === null ||
        JSON.parse(atob(request.body.data)) === undefined
      ) {
        // Request body is null or undefined
        // Handle the case here
        reply
          .status(400)
          .send({ status: false, message: "Request body cannot be null." });
      }
    } catch (error) {
      reply
        .status(400)
        .send({ status: false, message: "Request body cannot be null." });
    }

    if (api) {
      if (api.name === "login") {
        // Login API
        await loginUser(request, reply);
      } else if (api.name === "sendotp") {
        // send Otp
        await sendOtp(request, reply);
      } else if (api.name === "conformotp") {
        // verify Otp
        await VerifyOtp(request, reply);
      } else if (api.name === "qr Invoice Details") {
        // qr bill wise Details
        await qrinvoiceDetails(request, reply);
      } else {
        // Check if User is Authenticated or not
        const { status, code, message } = await checkCookie(
          request,
          reply,
          next
        );

        if (status == true) {
          await allApiCall(request, reply, api);
        } else {
          reply.status(code).send({ status: false, message: message });
        }
      }
    } else {
      // API not found
      reply.status(404).send({ status: false, message: "Not found" });
    }
  });
}
