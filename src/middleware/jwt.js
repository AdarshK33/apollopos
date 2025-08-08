import jwt from "jsonwebtoken";
const jwtSecretKey = process.env.SECRET_KEY;

export const generateAccessToken = async (payload) => {
  return jwt.sign(payload, jwtSecretKey, { expiresIn: "10m" });
};

export const generateRefreshToken = async (payload) => {
  return jwt.sign(payload, jwtSecretKey, { expiresIn: "30m" });
};

export const checkCookie = async (request, reply, next) => {
  if (Object.keys(request.cookies).length === 0) {
    // check for basic auth header
    if (
      !request.headers.authorization ||
      request.headers.authorization.indexOf("Basic ") === -1
    ) {
      return { status: false, code: 401, message: "Invalid token" };
    }

    // verify auth credentials
    const base64Credentials = request.headers.authorization.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");
    console.log(username, password);
    return username == process.env.ID && password == process.env.PASSWORD
      ? { status: true }
      : { status: false, code: 401, message: "Invalid token" };
  } else {
    return await isAuthenticatedUser(request, reply, next);
  }
};

export const isAuthenticatedUser = async (request, reply, next) => {
  try {
    let status = true;
    let bearerHeader,
      accessToken,
      refreshToken,
      bearerToken,
      decodedRefreshToken;
    // Get the token from cookies
    bearerHeader = JSON.parse(request.cookies.session);
    bearerToken = bearerHeader.SSID;

    jwt.verify(bearerToken, jwtSecretKey, async (accessTokenError, user) => {
      if (accessTokenError) {
        if (accessTokenError.name == "TokenExpiredError") {
          // Access token expired, check for refresh token
          refreshToken = bearerHeader.SRID;

          jwt.verify(
            refreshToken,
            jwtSecretKey,
            async (refreshTokenError, user) => {
              if (refreshTokenError) {
                if (refreshTokenError.name == "TokenExpiredError") {
                  reply.clearCookie("session", { path: "/" });
                  return reply.status(401).send({ message: "Unauthorized!" });
                } else if (refreshTokenError.name == "JsonWebTokenError") {
                  reply.clearCookie("session", { path: "/" });
                  return reply.status(403).send({ message: "Access Denied." });
                }
              }

              decodedRefreshToken = jwt.decode(refreshToken);

              accessToken = await generateAccessToken({
                userName: decodedRefreshToken.userName,
                vendorName: decodedRefreshToken.vendorName,
              });

              refreshToken = await generateRefreshToken({
                userName: decodedRefreshToken.userName,
                vendorName: decodedRefreshToken.vendorName,
              });

              // Update the session with the new access token
              const session = {
                SSID: accessToken,
                SRID: refreshToken,
                VID: bearerHeader.VID,
                roleId: bearerHeader.roleId,
                vendorName: bearerHeader.vendorName,
                user: bearerHeader.user,
              };

              return reply.setCookie("session", JSON.stringify(session), {
                httpOnly: true,
                secure: true,
                path: "/",
              });
            }
          );
        }
      }
    });

    return { status: status, code: 200, message: "Unauthorized" };
  } catch (error) {
    reply.clearCookie("session", { path: "/" });
    return { status: false, code: 401, message: "Invalid token" };
  }
};
