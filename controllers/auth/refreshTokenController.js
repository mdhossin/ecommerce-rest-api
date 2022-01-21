import Joi from "joi";
import { REFRESH_SECRET } from "../../config";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";

const refreshTokenController = {
  async refreshToken(req, res, next) {
    // validation

    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });

    const { error } = refreshSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    // find token form the database
    let refreshToken;

    try {
      refreshToken = await RefreshToken.findOne({
        token: req.body.refresh_token,
      });

      if (!refreshToken) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
      }

      // veryfiy the token here
      let userId;

      try {
        const { _id } = await JwtService.verify(
          refreshToken.token,
          REFRESH_SECRET
        );
        userId = _id;
      } catch (err) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
      }
      //

      // match the user from the database

      const user = await User.findOne({ _id: userId });
      if (!user) {
        return next(CustomErrorHandler.unAuthorized("User not found"));
      }

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
    } catch (err) {
      return next(new Error("Something went wrong " + err.message));
    }
  },
};

export default refreshTokenController;
