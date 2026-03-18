import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/auth.routes.js";
import flatsRoutes from "./routes/flats.routes.js";
import plansRoutes from "./routes/plans.routes.js";
import recordsRoutes from "./routes/records.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import usersRoutes from "./routes/users.routes.js";
import pushTokensRoutes from "./routes/pushTokens.routes.js";
import { configurePassport } from "./config/passport.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: String(process.env.NODE_ENV).toLowerCase() === "production",
    },
  }),
);

configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/flats", flatsRoutes);
app.use("/api/v1/plans", plansRoutes);
app.use("/api/v1/records", recordsRoutes);
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/notifications", notificationsRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/push-tokens", pushTokensRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});