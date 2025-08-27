import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { upload } from "../middlewares/multer";
import multer from "multer";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from "../controllers/product";

import {
  createProductSchema,
  updateProductSchema,
  listProductQuerySchema,
  getProductParamSchema,
  deleteProductParamSchema,
  restoreProductParamSchema,
} from "../validators/product";

const router = Router();
const noFiles = multer().none();

router.get("/products", validate(listProductQuerySchema), getProducts);
router.get("/product/:id", validate(getProductParamSchema), getProduct);

router.post(
  "/products",
  authenticate,
  authorize("SUPPLIER"),
  upload.single("imageUrl"),
  validate(createProductSchema),
  createProduct
);

router.patch(
  "/product/:id",
  authenticate,
  authorize("SUPPLIER"),
  noFiles,
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  "/product/:id",
  authenticate,
  authorize("SUPPLIER"),
  validate(deleteProductParamSchema),
  deleteProduct
);

router.patch(
  "/product/:id/restore",
  authenticate,
  authorize("SUPPLIER"),
  validate(restoreProductParamSchema),
  restoreProduct
);

export default router;
