import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtService";

const auth = async (req, res, next) => {
  // get the token form the client
  let authHeader = req.headers.authorization;
  console.log(authHeader, "header");
  if (!authHeader) {
    return next(CustomErrorHandler.unAuthorized());
  }

  const token = authHeader.split(" ")[1];
  console.log(token, "token");

  try {
    // destructuring from the jwt token headers
    const { _id, role } = await JwtService.verify(token);

    // create a user
    const user = {
      _id,
      role,
    };

    // set the user inside request

    req.user = user;
    next();

    //
  } catch (err) {
    return next(CustomErrorHandler.unAuthorized());
  }
};

export default auth;
