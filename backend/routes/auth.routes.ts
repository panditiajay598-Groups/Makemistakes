import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

router.post("/send-otp", AuthController.sendOTP);
router.post("/verify-otp", AuthController.verifyOTP);
router.post("/resend-otp", AuthController.resendOTP);

export default router;
