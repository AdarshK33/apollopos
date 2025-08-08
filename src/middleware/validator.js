
export const validator = async (request, reply,requestBody, requestBodySchema) => {
  try {
    // Validate the request body using the Joi schema
    await requestBodySchema.validateAsync(requestBody, { abortEarly: false });
  } catch (error) {
    console.log("error==", error);
    // Return all errors as an array
    const errors = error.details.map((detail) => detail.message.replace(/["]/g, ''));
    return errors;
  }
  return null; // Return null if validation passes
};
