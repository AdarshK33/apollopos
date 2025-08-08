import path from "path";
const __dirname = path.resolve();
import AutoLoad from "@fastify/autoload";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
export const options = {};

export default async function (fastify, opts) {
  // cors enabled
  fastify.register(cors, {
    origin: [
      "http://localhost:3000",
      "http://apollopos-ui.theretailinsightsdemos.com",
      "http://apolloqr-ui.theretailinsightsdemos.com",
    ],
    credentials: true,
  });

  // cookie enabled
  fastify.register(fastifyCookie, {
    secret: process.env.SECRET_KEY,
  });

  // Without this call, the request body with the content type application/json would be processed by the built-in JSON parser
  fastify.removeAllContentTypeParsers();

  // Define a custom content type parser with a custom body limit
  const customBodyLimit = 1024 * 1024 * 20; // 20MB
  fastify.addContentTypeParser(
    "*",
    { parseAs: "string", bodyLimit: customBodyLimit },
    (req, payload, done) => {
      done(null, payload);
    }
  );

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "src/plugins"),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "src/routes"),
    options: Object.assign({}, opts),
  });
}
