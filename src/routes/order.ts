import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createOrderSchema, getOrdersQuerySchema } from "../validators/order";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrdersSummary,
} from "../controllers/order";

const router = Router();

router.post("/orders", authenticate, validate(createOrderSchema), createOrder);

router.get(
  "/orders/me",
  authenticate,
  validate(getOrdersQuerySchema),
  getMyOrders
);

router.get(
  "/orders",
  authenticate,
  authorize("SUPPLIER"),
  validate(getOrdersQuerySchema),
  getAllOrders
);

router.get(
  "/orders/summary",
  authenticate,
  authorize("SUPPLIER"),
  getOrdersSummary
);

export default router;
