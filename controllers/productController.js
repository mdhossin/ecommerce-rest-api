import Joi from "joi";
import multer from "multer";
import path from "path";
import fs from "fs";
import CustomErrorHandler from "../services/CustomErrorHandler";
import { Product } from "../models";
import productSchema from "../vaildator/productValidator";

// create storage using multer for file upload

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    // create a unique name for every image like
    // 5644654654654-564454564.png
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const handelMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image");

const productController = {
  async store(req, res, next) {
    // mutipart format data
    handelMultipartData(req, res, async (err) => {
      // if found error run this code
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }

      // data here
      // console.log(req.file);
      const filePath = req.file.path;

      // validation data when send from the client

      const { error } = productSchema.validate(req.body);

      if (error) {
        // delete the uploaded image file
        // here use the fs module node js inbuild module have one method --  unlink() for delete ing

        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        });

        //

        return next(error);
      }

      // don't have any error run this code

      const { name, price, size } = req.body;

      let document;

      try {
        document = await Product.create({
          name,
          price,
          size,
          image: filePath,
        });
      } catch (err) {
        return next(err);
      }

      res.status(201).json(document);
    });
  },

  async update(req, res, next) {
    // mutipart format data
    handelMultipartData(req, res, async (err) => {
      // if found error run this code
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }

      // data here
      // console.log(req.file);
      let filePath;
      if (req.file) {
        filePath = req.file.path;
      }

      // validation data when send from the client

      const { error } = productSchema.validate(req.body);

      if (error) {
        // delete the uploaded image file
        // here use the fs module node js inbuild module have one method --  unlink() for delete ing

        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
        }

        //

        return next(error);
      }

      // don't have any error run this code

      const { name, price, size } = req.body;

      let document;

      try {
        document = await Product.findOneAndUpdate(
          { _id: req.params.id },
          {
            name,
            price,
            size,
            ...(req.file && { image: filePath }),
          },
          { new: true }
        );

        // console.log(document, "document");
      } catch (err) {
        return next(err);
      }

      res.status(201).json(document);
    });
  },
  // delter route
  async destroy(req, res, next) {
    const document = await Product.findOneAndRemove({ _id: req.params.id });
    if (!document) {
      return next(new Error("Nothing found  to delete"));
    }
    // imgae delete form the uploads folder
    console.log(document, "delete document");
    const imagePath = document._doc.image;
    fs.unlink(`${appRoot}/${imagePath}`, (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      return res.json(document);
    });
  },

  async getAllProducts(req, res, next) {
    let documents;
    try {
      documents = await Product.find()
        .select("-updatedAt -__v")
        .sort({ _id: -1 });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }

    res.json(documents);
  },

  async getByIdProduct(req, res, next) {
    let document;
    try {
      document = await Product.findOne({ _id: req.params.id }).select(
        "-updatedAt -__v"
      );
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }

    res.json(document);
  },
};

export default productController;
