import {
  postAPIRequest,
  postAPIwithheader,
  postAPIwithheaderqr,
  postAPIRequestPlaceOrder,
} from "../controller/axios.js";
import { request as _request } from "https";
import { findVendor } from "../controller/findvendor.js";
import Joi from "joi";
import { validator } from "../middleware/validator.js";
import dayjs from "dayjs";
import { log } from "console";

const orderHistoryRequestBodySchema = Joi.object({
  FromDate: Joi.string().required(),
  key: Joi.string().optional(),
  UserId: Joi.string().optional(),
  mobileNo: Joi.number().optional(),
  ToDate: Joi.string().required(),
  filter: Joi.string().optional(),
});
const orderWithMobileRequestBodySchema = Joi.object({
  Key: Joi.string().optional(),
  PhoneNumber: Joi.number().integer().optional(),
  FromDate: Joi.string().required(),
  UserId: Joi.string().optional(),
  mobileNo: Joi.number().optional(),
  ToDate: Joi.string().required(),
  filter: Joi.string().optional(),
});

const orderwithCustomerPhoneRequestBodySchema = Joi.object({
  FromDate: Joi.string().required(),
  ToDate: Joi.string().required(),
  UserId: Joi.string().optional(),
  mobileNo: Joi.string().required(),
  filter: Joi.string().required(),
});

const cancelOrderRequestBodySchema = Joi.object({
  OrderNo: Joi.string().required(),
  Remarks: Joi.string().required(),
  VendorName: Joi.string().required(),
});

// const createOrderRequestBodySchema = Joi.object({
//   email: Joi.string().required(),
//   mobilenumber: Joi.number().integer().required(),
//   firstname: Joi.string().required(),
//   lastname: Joi.string().required(),
//   vendorname: Joi.string().optional(),
//   vendortoken: Joi.string().optional(),
//   UHID: Joi.string().allow('').optional(),
//   products: Joi.array().items(Joi.object()).required(),
//   payment: Joi.string().required(),
//   store_id: Joi.string().optional(),
//   billing: Joi.object({
//     PATIENTNAME: Joi.string().required(),
//     ADDRESS: Joi.string().required(),
//     CITY: Joi.string().required(),
//     PHONENUMBER: Joi.number().integer().required(),
//     STATE: Joi.string().required(),
//     UHID: Joi.string().allow('').optional(),
//     VENDORNAME: Joi.string().optional(),
//     POSTALCODE: Joi.number().integer().required(),
//     $$hashKey: Joi.optional()
//   }).required(),
//   shipping: Joi.object({
//     PATIENTNAME: Joi.string().required(),
//     ADDRESS: Joi.string().required(),
//     CITY: Joi.string().required(),
//     PHONENUMBER: Joi.number().integer().required(),
//     STATE: Joi.string().required(),
//     UHID: Joi.string().allow('').optional(),
//     VENDORNAME: Joi.string().optional(),
//     POSTALCODE: Joi.number().integer().required(),
//     $$hashKey: Joi.optional()
//   }).required(),
//   shipping_method: Joi.string().required(),
//   prescriptions: Joi.array().items(Joi.string()).required(),
//   user_id: Joi.string().optional(),
//   coupon_code: Joi.string().allow(null).optional(),
// });

const prescriptionOrderRequestBodySchema = Joi.object({
  email: Joi.string().email().required(),
  mobilenumber: Joi.number().integer().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  payment: Joi.string().required(),
  store_id: Joi.string().optional(),
  vendorname: Joi.string().optional(),
  vendortoken: Joi.string().optional(),
  billing: Joi.object({
    PATIENTNAME: Joi.string().required(),
    ADDRESS: Joi.string().required(),
    CITY: Joi.string().required(),
    PHONENUMBER: Joi.number().integer().required(),
    STATE: Joi.string().required(),
    UHID: Joi.string().allow("").required(),
    VENDORNAME: Joi.string().optional(),
    POSTALCODE: Joi.number().integer().required(),
    $$hashKey: Joi.optional(),
  }).required(),
  shipping: Joi.object({
    PATIENTNAME: Joi.string().required(),
    ADDRESS: Joi.string().required(),
    CITY: Joi.string().required(),
    PHONENUMBER: Joi.number().integer().required(),
    STATE: Joi.string().required(),
    UHID: Joi.string().allow("").required(),
    VENDORNAME: Joi.string().optional(),
    POSTALCODE: Joi.number().integer().required(),
    $$hashKey: Joi.optional(),
  }).required(),
  shipping_method: Joi.string().required(),
  prescriptions: Joi.array().items(Joi.string()).required(),
  user_id: Joi.string().required(),
});

export const orderHistory = async (request, reply) => {
  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      url =
        "https://online.apollopharmacy.org/MAPPSUAT/apollompos/Self/OrderHistory",
      response,
      vendorToken,
      bearerHeader;

    //validate the body
    const error = await validator(
      request,
      reply,
      userDetails,
      orderHistoryRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }

    if (Object.keys(request.cookies).length !== 0) {
      bearerHeader = JSON.parse(request.cookies.session);
      userDetails.UserId = bearerHeader.user;
      vendorToken = await findVendor(bearerHeader.vendorName);
      userDetails.key = vendorToken[0].role_key;
    }
    console.log(userDetails);
    response = await postAPIRequest(url, userDetails);
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const cancelOrders = async (request, reply) => {
  //->   /order_cancel/

  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      url = "https://online.apollopharmacy.org/UAT/OrderPlace.svc/CANCELORDERS",
      bearerHeader,
      response;
    if (Object.keys(request.cookies).length !== 0) {
      bearerHeader = JSON.parse(request.cookies.session);
      userDetails.VendorName = bearerHeader.vendorName;
    }
    //validate the body

    const error = await validator(
      request,
      reply,
      userDetails,
      cancelOrderRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }
    console.log(userDetails);
    response = await postAPIRequest(url, userDetails);
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const ordersWithMobile = async (request, reply) => {
  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      url =
        "https://online.apollopharmacy.org/MAPPSUAT/apollompos/Self/OrderHistoryWithPhoneNumber",
      response,
      bearerHeader,
      filterData,
      fromDate,
      toDate,
      vendorToken;
    //validate the body
    const error = await validator(
      request,
      reply,
      userDetails,
      orderWithMobileRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }

    if (Object.keys(request.cookies).length !== 0) {
      bearerHeader = JSON.parse(request.cookies.session);
      // userDetails.UserId = bearerHeader.vendorName;
      vendorToken = await findVendor(bearerHeader.vendorName);
      userDetails.key = vendorToken[0].role_key;
    }
    filterData = {
      Key: userDetails.key,
      PhoneNumber: userDetails.mobileNo,
    };
    response = await postAPIRequest(url, filterData);
    if (response.message == "Success") {
      fromDate = dayjs(userDetails.FromDate);
      toDate = dayjs(userDetails.ToDate);
      response.Orders = response.Orders.filter((item) => {
        const itemDate = dayjs(item.OrderDate);
        return itemDate.isAfter(fromDate) && itemDate.isBefore(toDate);
      });
      return reply.status(200).send(response);
    } else if (response.message == "Faild") {
      return reply.status(500).send(response);
    }
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const orderwithCustomerPhone = async (request, reply) => {
  //->   /ordersforvendormobile/

  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      url =
        "https://online.apollopharmacy.org/MAPPSUAT/apollompos/Self/OrderHistoryForSSO",
      response,
      bearerHeader;
    //validate the body
    const error = await validator(
      request,
      reply,
      userDetails,
      orderwithCustomerPhoneRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }

    if (Object.keys(request.cookies).length !== 0) {
      bearerHeader = JSON.parse(request.cookies.session);
      userDetails.UserId = bearerHeader.user;
    }

    response = await postAPIRequest(url, userDetails);
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const createOrder = async (request, reply) => {
  try {
    let orderDetails = JSON.parse(atob(request.body.data)),
      url =
        process.env.MAGENTO_BASE_URL +
        "/rest/default/V1/orderpunchingapis/orderplace",
      response,
      bearerHeader,
      vendorToken;

    if (Object.keys(request.cookies).length !== 0) {
      bearerHeader = JSON.parse(request.cookies.session);
      orderDetails.vendorname = bearerHeader.vendorName;

      vendorToken = await findVendor(bearerHeader.vendorName);
      orderDetails.shipping.VENDORNAME = bearerHeader.vendorName;
      orderDetails.vendortoken = vendorToken[0].role_token;
      orderDetails.store_id = bearerHeader.vendorName;
      orderDetails.billing.VENDORNAME = bearerHeader.vendorName;
    }

    //validate the req.body
    // const error = await validator(request, reply, orderDetails, createOrderRequestBodySchema)

    // if (error) {
    //   return reply.status(400).send({
    //     success: false,
    //     message: error,
    //   });
    // }

    response = await postAPIRequestPlaceOrder(url, {
      params: JSON.stringify(orderDetails),
    });

    // paytem not use
    if (orderDetails.payment == "paytm") {
      const PaytmChecksum = require("./PaytmChecksum");
      var paytmParams = {};
      paytmParams.body = {
        requestType: "Payment",
        mid: "Apollo21781184751615",
        websiteName: "WEBSTAGING",
        orderId: JSON.parse(response.body)[0].order_id,
        callbackUrl:
          "http://apo-order.theretailinsightsdemos.com/paytmcallback/",
        txnAmount: {
          value: "1.00",
          currency: "INR",
        },
        userInfo: {
          custId: "CUST_001",
        },
      };
      PaytmChecksum.generateSignature(
        JSON.stringify(paytmParams.body),
        "BRpRyd8SlDEB!8EL"
      ).then(function (checksum) {
        paytmParams.head = {
          signature: checksum,
        };
        var post_data = JSON.stringify(paytmParams);
        var options = {
          hostname: "securegw-stage.paytm.in",
          port: 443,
          path:
            "/theia/api/v1/initiateTransaction?mid=Apollo21781184751615&orderId=" +
            JSON.parse(response.body)[0].order_id,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };
        var result = "";
        var post_req = _request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            result += chunk;
          });

          post_res.on("end", function () {
            reply.status(200).send({
              data: JSON.parse(response.body)[0],
              url:
                "https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=Apollo21781184751615&orderId=" +
                JSON.parse(response.body)[0].order_id +
                "&txnToken=" +
                JSON.parse(result).body.txnToken,
            });
          });
        });

        post_req.write(post_data);
        post_req.end();
      });
    } else {
      if (response.status == 200) {
        reply.status(200).send({ success: true, data: [response] });
      } else {
        reply
          .status(500)
          .send({ status: false, message: response.data.message });
      }
    }
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const prescriptionOrder = async (request, reply) => {
  try {
    let orderDetails = JSON.parse(atob(request.body.data)),
      url =
        process.env.MAGENTO_BASE_URL +
        "/rest/default/V1/orderpunchingapis/uploadprescription",
      response,
      bearerHeader,
      vendorToken;

    if (Object.keys(request.cookies).length !== 0) {
      bearerHeader = JSON.parse(request.cookies.session);
      orderDetails.vendorname = bearerHeader.vendorName;
      vendorToken = await findVendor(bearerHeader.vendorName);
      orderDetails.vendortoken = vendorToken[0].role_token;
      orderDetails.store_id = bearerHeader.vendorName;
      orderDetails.billing.VENDORNAME = bearerHeader.vendorName;
      orderDetails.shipping.VENDORNAME = bearerHeader.vendorName;
    }

    //validate the req.body
    const error = await validator(
      request,
      reply,
      orderDetails,
      prescriptionOrderRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }

    response = await postAPIRequest(url, {
      params: JSON.stringify(orderDetails),
    });

    if (response[0].status == 200) {
      reply.status(200).send({ success: true, data: [response[0]] });
    } else {
      reply.status(400).send({ success: false, msg: "Please try again later" });
    }
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const chronicsalesdetails = async (request, reply) => {
  try {
    let userDetails = JSON.parse(atob(request.body.data));
    var options = {
      method: "POST",
      url: "https://online.apollopharmacy.org/DL/Apollo/Synapse/Chronicsalesdetails",
      headers: {
        "Content-Type": "application/json",
        "Auth-Token": "yvEoG+8MvYiOfhV2wb5jdalk",
      },
      body: JSON.stringify(userDetails),
    };
    let url =
      "https://online.apollopharmacy.org/DL/Apollo/Synapse/Chronicsalesdetails";
    const response = await postAPIRequest(url, userDetails);
    if (response.status == true) {
      reply.status(200).send({ status: true, data: response });
    } else {
      reply.status(400).send({ status: false, msg: "No users are present." });
    }
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const orderFilterAPI = async (request, reply) => {
  try {
    let userDetails = JSON.parse(atob(request.body.data));
    return userDetails.filter == "filterMobileAndDate"
      ? await ordersWithMobile(request, reply)
      : await orderHistory(request, reply);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "Internal server error" });
  }
};

export const qrinvoiceDetails = async (request, reply) => {
  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      response,
      header,
      url,
      skuDetails;
    url =
      "https://online.apollopharmacy.org/DL/Apollo/Synapse/billwisesalesdetails";
    header = {
      "Content-Type": "application/json",
      "Auth-Token": "yvEoG+8MvYiOfhV2wb5jdalk",
    };
    response = await postAPIwithheader(url, userDetails, header);
    if (response?.requeststatus == true) {
      response?.billdetails.forEach((bill) => {
        bill?.itemdetails.forEach(async (item) => {
          const { itemid, itemname, mrp, discamount } = item; // Destructure item
          item.sku = itemid; // Assign the value of "itemid" to the new "sku" key
          item.name = itemname;
          item.price = mrp;
          item.special_price = discamount;
          // Delete the old keys
          delete item.itemid;
          delete item.itemname;
          delete item.mrp;
          delete item.discamount;
          skuDetails = {
            skucategory: [
              {
                sku: item.sku,
              },
            ],
          };
          // item.id = await postAPIwithheaderqr(skuDetails);
        });
      });
      // await getID(response, reply)
      const updatedItemDetails = await Promise.all(
        response.billdetails[0].itemdetails.map(async (item) => {
          const sku = item.sku;
          const id = await getID(sku);
          // Replace with your API call to get the ID
          // Add the id field to the item and return it
          return { ...item, id };
        })
      );
      // Update the original data with the updated item details
      response.billdetails[0].itemdetails = updatedItemDetails;
      reply.status(200).send({ status: true, data: response });
    } else {
      reply.status(400).send({ status: false, msg: "No users are present." });
    }
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const getID = async (data) => {
  try {
    let response, skuDetails;
    skuDetails = {
      skucategory: [
        {
          sku: data,
        },
      ],
    };
    return (response = await postAPIwithheaderqr(skuDetails));
  } catch (error) {
    return error;
  }
};
