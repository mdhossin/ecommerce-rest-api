import express from "express";
import {
  registerController,
  loginController,
  userController,
  refreshTokenController,
  productController,
} from "../controllers";
import admin from "../middlewares/admin";
import auth from "../middlewares/auth";

const router = express.Router();

// register user route
router.post("/register", registerController.register);
// login user route
router.post("/login", loginController.login);

// get the user details route
// here use the router lever middleware auth middleware
router.get("/me", auth, userController.me);

// refresh token route
router.post("/refreshToken", refreshTokenController.refreshToken);

// logout route
router.post("/logout", auth, loginController.logout);

// create product route
router.post("/products", [auth, admin], productController.store);

// update prodcut route
router.put("/products/:id", [auth, admin], productController.update);

// delete product route
router.delete("/products/:id", [auth, admin], productController.destroy);

// get all products route
router.get("/products", productController.getAllProducts);

// get single product by id route

router.get("/products/:id", productController.getByIdProduct);

export default router;
