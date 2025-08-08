import { postAPIRequest, getAPIRequest } from "../controller/axios.js";
import { privilegeDetails } from "../controller/privileges.js";

export const login = async (request, reply) => {
  try {
    const userDetails = JSON.parse(atob(request.body.data));
    // Object destructuring to create requestData
    const { email: username, password, key } = userDetails;
    const requestData = { username, password, key };

    const url =
      "https://online.apollopharmacy.org/MAPPSUAT/apollompos/Self/LOGINVENDORDETAILSFORALL";
    const response = await postAPIRequest(url, requestData);
    return response;
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const vendorSearch = async (request, response) => {
  let options = {
      params: {
        "searchCriteria[filterGroups][0][filters][0][field]": "code",
        "searchCriteria[filterGroups][0][filters][0][value]": `${response.DeviceDetails.VENDORNAME}`,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.MAGENTO_TOKEN,
      },
    },
    url =
      process.env.MAGENTO_BASE_URL + "/rest/default/V1/customerGroups/search",
    data;

  data = await getAPIRequest(url, options);
  return data;
};

export const updatePassword = async (request, reply) => {
  try {
    let userDetails = JSON.parse(atob(request.body.data)),
      url = "https://online.apollopharmacy.org/BHEL/Apollo/BHEL/UpdatePassword",
      response;
    response = await postAPIRequest(url, userDetails);
    if (response.status == true) {
      reply.status(200).send(response);
    } else {
      reply.status(400).send({ status: false, msg: "No users are present." });
    }
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const ssoVerify = async (request, reply) => {
  try {
    let token = JSON.parse(atob(request.body.data)),
      url =
        "https://sso-login.theretailinsightsdemos.com/apollo-api/auth-verify";
    (config = {
      headers: {
        Authorization: `${token}`,
      },
    }),
      response;

    response = await getAPIRequest(url, config);
    if (response.status == true) {
      reply.status(200).send(response);
    } else {
      reply.status(400).send({ status: false, msg: "No users are present." });
    }
    return reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const privilege = async (request, reply) => {
  try {
    let bearerHeader, data, response;
    //get the roleId from cookies
    bearerHeader = JSON.parse(request.cookies.session);

    data = await privilegeDetails(bearerHeader.roleId);

    if (data.length) {
      response = {
        vendorName: data[0].role_name,
        homepagePath: "/dashboard",
        privilege: data.map((item) => {
          return {
            path: item.component_name,
            permissions: item.permission,
          };
        }),
      };
      reply.status(200).send(response);
    } else {
      reply.status(404).send({ message: "Not found" });
    }
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};

export const logout = async (request, reply) => {
  try {
    reply.clearCookie("session", { path: "/" }).status(200).send({
      status: true,
      message: "user logout successfully",
    });
  } catch (error) {
    reply.status(500).send({ status: false, message: error });
  }
};
