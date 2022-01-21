import { DEBUG_MODE } from "../config";
import { ValidationError } from "joi";
import CustomErrorHandler from "../services/CustomErrorHandler";
// error handeling middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;

  let data = {
    message: "Internal server error",
    ...(DEBUG_MODE === "true" && { originalError: err.message }),
  };
  // from joi
  if (err instanceof ValidationError) {
    // 422 mean validation error code
    statusCode = 422;
    data = {
      message: err.message,
    };
  }

  //  from custom err handeler
  if (err instanceof CustomErrorHandler) {
    statusCode = err.status;
    data = {
      message: err.message,
    };
  }

  return res.status(statusCode).json(data);
};

export default errorHandler;
