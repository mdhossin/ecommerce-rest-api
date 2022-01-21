import Joi from "joi";
import bcrypt from "bcrypt";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const loginController = {
  async login(req, res, next) {
    // validation with schema\

    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
    });

    const { error } = loginSchema.validate(req.body);
    console.log(req.body);

    if (error) {
      return next(error);
    }

    const { email, password } = req.body;

    try {
      // find user email from the database
      const user = await User.findOne({ email });
      if (!user) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      // compare the password
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      console.log(user, "user");
      // send token clinet

      const access_token = JwtService.sign({
        _id: user._id,
        role: user.role,
      });

      // refresh token
      const refresh_token = JwtService.sign(
        { _id: user._id, role: user.role },
        "1y",
        REFRESH_SECRET
      );

      // add to the databse whitelist

      await RefreshToken.create({ token: refresh_token });

      res.json({ access_token, refresh_token });

      //
    } catch (err) {
      return next(err);
    }
  },

  async logout(req, res, next) {
    // validation
    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });

    const { error } = refreshSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    try {
      await RefreshToken.deleteOne({ token: req.body.refresh_token });
    } catch (err) {
      return next(new Error("Something went wrong in the database"));
    }
    res.json({ status: 200 });
  },
};

export default loginController;
