import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";

const userController = {
  async me(req, res, next) {
    try {
      // this req.user_id get the data from the auth middleware because every request comes to the middleware that's way i can get the data
      const user = await User.findOne({ _id: req.user._id }).select(
        "-password -updatedAt -__v"
      );

      // if the user not found throw this error message
      if (!user) {
        return next(CustomErrorHandler.notFound());
      }

      res.json(user);
    } catch (err) {
      return next();
    }
  },
};

export default userController;
