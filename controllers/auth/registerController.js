import Joi from "joi";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import bcrypt from "bcrypt";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

// follow the MVC PATTERN mvc --- model view controller

const registerController = {
  // register callback route
  async register(req, res, next) {
    // CHECKLIST step by step need to do
    // [ ] validate the request
    // [ ] authorise the request
    // [ ] check if user is in the database already
    // [ ] prepare model
    // [ ] store in database
    // [ ] generate jwt token
    // [ ] send response

    //  create schema useing joi for validation

    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      repeat_password: Joi.ref("password"),
    });

    const { error } = registerSchema.validate(req.body);
    // console.log(req.body, "body from");
    if (error) {
      return next(error);
    }

    // check if user is in the database already
    try {
      // here useing the user model
      const exist = await User.exists({ email: req.body.email });

      if (exist) {
        // here need to custom error send to the client side
        return next(
          CustomErrorHandler.alreadyExist("This email is already taken")
        );
      }
    } catch (err) {
      // he takes the error message form errorHandler default message
      // below this error he send to the front end
      // let statusCode = 500;

      // let data = {
      //   message: "Internal server error",
      //   ...(DEBUG_MODE === "true" && { originalError: err.message }),
      // };

      return next(err);
    }
    // destructuring object
    const { name, email, password } = req.body;
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // prepare the model to store user data on databse

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    let access_token;
    let refresh_token;

    try {
      const result = await user.save();
      console.log(result);

      // implement jwt token send to the database
      access_token = JwtService.sign({ _id: result._id, role: result.role });
      refresh_token = JwtService.sign(
        { _id: result._id, role: result.role },
        "1y",
        REFRESH_SECRET
      );

      // add to the databse whitelist

      await RefreshToken.create({ token: refresh_token });
    } catch (err) {
      return next(err);
    }

    // send to the databse when user register
    res.json({ access_token, refresh_token });
  },
};

export default registerController;
