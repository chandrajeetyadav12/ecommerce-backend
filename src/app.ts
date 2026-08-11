import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import sellerRoutes from "./routes/seller.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use(
  "/api/categories",
  categoryRoutes
); 
app.use(
  "/api/seller",
  sellerRoutes
);

app.use(
  "/api/products",
  productRoutes
);
export default app;