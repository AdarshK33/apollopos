import { getAPIRequest, postAPIRequest } from "../controller/axios.js";
import { getsearchHistory, searchHistory } from "../controller/findvendor.js";
import Joi from "joi";
import { validator } from "../middleware/validator.js";

const searchAPIRequestBodySchema = Joi.object({
  searchTerm: Joi.string().required(),
  pageSize: Joi.required(),
  currentPage: Joi.required(),
});

const searchElasticAPIRequestBodySchema = Joi.object({
  term: Joi.string().required(),
  pageSize: Joi.required(),
  currentPage: Joi.required(),
  customerGroupId: Joi.optional(),
});

export const search = async (request, reply) => {
  try {
    let searchTerm = "%" + request.query.searchTerm + "%",
      pageSize = request.query.pageSize,
      currentPage = request.query.currentPage,
      bearerHeader,
      userDetails,
      config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms",
        },
        params: {
          "searchCriteria[filterGroups][2][filters][0][field]": "status",
          "searchCriteria[filterGroups][2][filters][0][condition_type]": "eq",
          "searchCriteria[filterGroups][2][filters][0][value]": 1,
          "searchCriteria[filterGroups][1][filters][0][field]":
            "quantity_and_stock_status",
          "searchCriteria[filterGroups][1][filters][0][condition_type]": "eq",
          "searchCriteria[filterGroups][1][filters][0][value]": 1,
          "searchCriteria[filterGroups][0][filters][0][field]": "name",
          "searchCriteria[filterGroups][0][filters][0][condition_type]": "like",
          "searchCriteria[filterGroups][0][filters][0][value]": searchTerm,
          "searchCriteria[filterGroups][0][filters][1][field]": "sku",
          "searchCriteria[filterGroups][0][filters][1][condition_type]": "like",
          "searchCriteria[filterGroups][0][filters][1][value]": searchTerm,
          // "searchCriteria[filterGroups][3][filters][0][field]": "visibility",
          // "searchCriteria[filterGroups][3][filters][0][condition_type]": "eq",
          // "searchCriteria[filterGroups][3][filters][0][value]": 1,
          // "searchCriteria[sortOrders][0][field]" : "qty",
          // "searchCriteria[sortOrders][0][direction]" : "desc",
          "searchCriteria[pageSize]": pageSize,
          "searchCriteria[currentPage]": currentPage,
          // "fields": "items[id,name,sku,status,price,extension_attributes[stock_item[qty,is_in_stock]],custom_attributes]"
        },
      },
      url = process.env.MAGENTO_BASE_URL + "/rest/default/V1/products",
      response;

    //for basic Auth
    if (Object.keys(request.cookies).length !== 0) {
      bearerHeader = JSON.parse(request.cookies.session);
      userDetails = bearerHeader.vendorName;
    }

    const requestBody = {
      searchTerm: request.query.searchTerm,
      pageSize,
      currentPage,
    };
    //validating the request body
    const error = await validator(
      request,
      reply,
      requestBody,
      searchAPIRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }

    response = await getAPIRequest(url, config);

    reply.status(200).send(response);
  } catch (error) {
    reply.status(500).send({ status: false, message: error.message });
  }
};

export const searchElastic = async (request, reply) => {
  try {
    let searchDetails = JSON.parse(atob(request.body.data));

    //validating the request body
    const error = await validator(
      request,
      reply,
      searchDetails,
      searchElasticAPIRequestBodySchema
    );

    if (error) {
      return reply.status(400).send({
        success: false,
        message: error,
      });
    }

    let searchTerm = searchDetails.term,
      pageSize = searchDetails.pageSize,
      fromId = (searchDetails.currentPage - 1) * pageSize,
      customerGroupId,
      bearerHeader,
      s1 =
        '{"_source":["entity_id","name","sku","price","image","stock","mou","is_prescription_required"],"size":',
      s2 = ',"from":',
      s3 = ',"query":{"bool":{"should":[{"multi_match":{"query":"',
      s4 =
        '*","type":"best_fields","fields":["name^3","sku"],"minimum_should_match":"50%"}}]}},"track_scores":true,"sort":{"_score":{"order":"desc"},"stock.qty":{"order":"desc"}}}',
      query = s1 + pageSize + s2 + fromId + s3 + searchTerm + s4,
      body = query.replace(/'/g, ""),
      url =
        process.env.MAGENTO_SEARCH_URL +
        "/magento2_default_catalog_product/_search",
      response;
    if (Object.keys(request.cookies).length !== 0) {
      bearerHeader = JSON.parse(request.cookies.session);
      customerGroupId = bearerHeader.VID;
    } else {
      customerGroupId = searchDetails.customerGroupId;
    }

    response = await postAPIRequest(url, body);

    if (response.hits.total > 0) {
      var modifiedResponse = await modifyElastiSearchData(
        response.hits.hits,
        customerGroupId
      );

      reply.status(200).send({
        status: false,
        items: modifiedResponse,
        total_count: response.hits.total,
      });
      //for basic Auth
      if (Object.keys(request.cookies).length !== 0) {
        bearerHeader = JSON.parse(request.cookies.session);
      }
      //  product search history stored in to db
      await searchHistory({
        vendor_name: bearerHeader.vendorName,
        search_product: searchTerm,
      });
    } else {
      reply.status(500).send({
        status: false,
        msg: "No products found",
      });
    }
  } catch (error) {
    console.log(error);
    reply.status(500).send({ status: false, message: error.message });
  }
};

export const modifyElastiSearchData = async (data, customerGroupId) => {
  var res = [];
  data.forEach((product) => {
    var array = {};
    array.id = product._source.entity_id;
    array.sku = product._source.sku;
    array.name = product._source.name[0];
    product._source.price.forEach((eachPrice) => {
      if (
        eachPrice.customer_group_id == 0 ||
        eachPrice.customer_group_id == customerGroupId
      ) {
        // array.price = Math.round( eachPrice.original_price * 100 + Number.EPSILON ) / 100;
        // array.special_price = Math.round( eachPrice.price * 100 + Number.EPSILON ) / 100;
        array.price = eachPrice.original_price;
        array.special_price = eachPrice.price;
      }
    });
    array.status = 1;
    if (product._source.stock) {
      array.is_in_stock = product._source.stock.is_in_stock;
      array.product_qty = product._source.stock.qty;
    } else {
      array.is_in_stock = false;
      array.product_qty = 0;
    }
    if (typeof product._source.mou == "object") {
      array.mou = product._source.mou[0];
    } else {
      array.mou = 1;
    }
    if (typeof product._source.is_prescription_required == "object") {
      array.is_prescription_required = 1;
    } else {
      array.is_prescription_required = 0;
    }
    if (product._source.image) {
      array.image_url =
        process.env.MAGENTO_BASE_URL +
        "/pub/media/catalog/product" +
        product._source.image[0];
    } else {
      array.image_url =
        process.env.MAGENTO_BASE_URL +
        "/pub/media/catalog/product" +
        "/placeholder/default/placeholder.jpg";
    }
    res.push(array);
  });
  return res;
};

export const updateSearchHistory = async (request, reply) => {
  try {
    let addcartProduchDetails = JSON.parse(atob(request.body.data)),
      bearerHeader = JSON.parse(request.cookies.session);

    //  product search history stored in to db
    await searchHistory({
      roles_id: bearerHeader.roleId,
      vendor_name: bearerHeader.vendorName,
      search_product: addcartProduchDetails.name,
      productID: addcartProduchDetails.id,
      sku: addcartProduchDetails.sku,
    });

    reply.status(200).send({
      status: true,
      message: "Product add to cart sucessfully",
    });
  } catch (error) {
    reply.status(500).send({ status: false, message: "Internal server error" });
  }
};

export const fetchSearchHistory = async (request, reply) => {
  let data,
    bearerHeader = JSON.parse(request.cookies.session),
    response;

  data = await getsearchHistory(bearerHeader.roleId);

  if (data.length) {
    response = data.map((item) => {
      return {
        name: item.search_product,
        id: item.productID,
        sku: item.sku,
      };
    });

    reply.status(200).send(response);
  } else {
    reply.status(200).send({
      message: "No data found.",
    });
  }
};
