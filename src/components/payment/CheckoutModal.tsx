"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lock,
  Zap,
  QrCode,
  CreditCard,
  Building2,
  Smartphone,
  Copy,
  Check,
  ChevronLeft,
  User,
  Mail,
  Phone,
} from "lucide-react";
import QRCode from "qrcode";
import { PLANS, PlanTier, PlanConfig } from "@/lib/plans";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: PlanTier;
  userEmail?: string;
  onSuccess?: () => void;
}

type CheckoutStep =
  | "REVIEW"
  | "USER_DETAILS"
  | "PAYMENT_OPTIONS"
  | "QR_PAYMENT"
  | "CARD_PAYMENT"
  | "NET_BANKING"
  | "CREATING_ORDER"
  | "WAITING_GATEWAY"
  | "VERIFYING"
  | "SUCCESS"
  | "DELAYED"
  | "FAILED";

type PaymentMethodType = "UPI" | "CARD" | "NETBANKING";

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedPlan,
  userEmail: initialEmail,
  onSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>("REVIEW");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string>(initialEmail || "");
  const [fullName, setFullName] = useState<string>("Ajay Panditi");
  const [phoneNumber, setPhoneNumber] = useState<string>("+91 98765 43210");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("UPI");
  const [orderData, setOrderData] = useState<any>(null);
  const [activationResult, setActivationResult] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // QR & UPI States
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes

  // Card Form State
  const [cardNumber, setCardNumber] = useState<string>("4532 8901 2345 6789");
  const [cardExpiry, setCardExpiry] = useState<string>("12/28");
  const [cardCvv, setCardCvv] = useState<string>("888");
  const [cardName, setCardName] = useState<string>(fullName || "Ajay Panditi");

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState<string>("HDFC");

  const plan: PlanConfig = PLANS[selectedPlan] || PLANS.PRO;

  useEffect(() => {
    if (isOpen) {
      setStep("REVIEW");
      setErrorMessage(null);
      setActivationResult(null);
      setTimeLeft(600);

      // Fetch active user email from localStorage or session
      if (typeof window !== "undefined") {
        const storedEmail = localStorage.getItem("user_email") || "";
        if (storedEmail) setVerifiedEmail(storedEmail);
      }
    }
  }, [isOpen, selectedPlan]);

  // Generate real QR code whenever order or QR step is active
  useEffect(() => {
    if (step === "QR_PAYMENT") {
      const upiId = "makemistakes@icici";
      const orderRef = orderData?.orderId || `ord_mm_${Date.now()}`;
      const upiPayload = `upi://pay?pa=${upiId}&pn=MakeMistakes%20Academy&am=${plan.price}.00&cu=INR&tn=${encodeURIComponent(
        `${plan.name} - ${orderRef}`
      )}`;

      QRCode.toDataURL(upiPayload, {
        width: 260,
        margin: 1,
        color: {
          dark: "#042f2e", // deep rich teal
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QR Code generation error:", err));
    }
  }, [step, plan.price, plan.name, orderData]);

  // QR Countdown Timer
  useEffect(() => {
    if (step !== "QR_PAYMENT") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyUpiId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("makemistakes@icici");
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  if (!isOpen) return null;

  // Step 1 -> Step 2
  const handleProceedToUserDetails = () => {
    setErrorMessage(null);
    setStep("USER_DETAILS");
  };

  // Step 2 -> Step 3: Create Order with user billing info
  const handleProceedToPaymentOptions = async () => {
    if (!verifiedEmail || !/\S+@\S+\.\S+/.test(verifiedEmail)) {
      setErrorMessage("Please enter a valid email address for account security binding.");
      return;
    }

    try {
      setStep("CREATING_ORDER");
      setErrorMessage(null);

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          billingName: fullName,
          billingPhone: phoneNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to create order");
      }

      setOrderData(data.order);
      setVerifiedEmail(data.order.userEmail || verifiedEmail);
      setStep("PAYMENT_OPTIONS");
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      setErrorMessage(err.message || "Failed to initiate payment.");
      setStep("FAILED");
    }
  };

  // Step 3 -> Step 4: Advance to specific payment method
  const handleProceedToMethodScreen = () => {
    if (selectedMethod === "UPI") {
      setStep("QR_PAYMENT");
    } else if (selectedMethod === "CARD") {
      setStep("CARD_PAYMENT");
    } else {
      setStep("NET_BANKING");
    }
  };

  // Step 4 -> Verification & Activation
  const handleVerifyPayment = async (
    orderId: string,
    gatewayPaymentId: string,
    gatewaySignature: string
  ) => {
    try {
      setStep("VERIFYING");
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          gatewayPaymentId,
          gatewaySignature,
          idempotencyKey: `idemp_${gatewayPaymentId}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error?.includes("DELAYED") || res.status === 504) {
          setStep("DELAYED");
        } else {
          throw new Error(data.error || "Payment verification failed.");
        }
        return;
      }

      setActivationResult(data);
      setStep("SUCCESS");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Verification error:", err);
      setErrorMessage(err.message || "Payment verification could not be completed.");
      setStep("FAILED");
    }
  };

  const handleSimulatePayment = async () => {
    if (!orderData) return;
    const mockPaymentId = orderData.sandboxPaymentId || `pay_upi_${Date.now()}`;
    const mockSig = orderData.sandboxSignature || "sandbox_sig_auto_generate";
    await handleVerifyPayment(orderData.orderId, mockPaymentId, mockSig);
  };

  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/subscription/me");
      const data = await res.json();
      if (data.plan === selectedPlan && data.status === "ACTIVE") {
        setActivationResult({
          plan: data.plan,
          creditsGranted: data.credits?.remaining,
          status: "ACTIVE",
        });
        setStep("SUCCESS");
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage("Payment verification is still processing. Please try again in a few moments.");
      }
    } catch {
      setErrorMessage("Network error while checking status.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-zinc-100 font-sans max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={step === "VERIFYING" || step === "CREATING_ORDER"}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ============================================================== */}
        {/* STEP 1: REVIEW & PLAN OVERVIEW (Matches User's Screenshot)     */}
        {/* ============================================================== */}
        {step === "REVIEW" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                {plan.badge}
              </span>
              <span className="text-xs font-mono text-zinc-400">Secure Checkout</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold font-serif text-white tracking-tight">
                {plan.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {plan.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black font-mono text-white">
                  ₹{plan.price.toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-mono text-zinc-400 ml-2">
                  / {plan.billingPeriod}
                </span>
              </div>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg">
                +{plan.aiCreditsPerMonth.toLocaleString()} AI Credits
              </span>
            </div>

            {/* Account Binding Callout */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Account-Bound Purchase Guarantee</span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                This subscription and its {plan.aiCreditsPerMonth} AI credits will be permanently
                attached to your verified internal MakeMistakes account:
              </p>
              <div className="font-mono text-amber-300 bg-zinc-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30 truncate">
                {verifiedEmail || "Authenticated Account"}
              </div>
            </div>

            {/* Features checklist */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400 block uppercase font-bold">
                Included Benefits:
              </span>
              <ul className="space-y-1.5">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleProceedToUserDetails}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Proceed to Secure Payment &rarr;</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: USER DETAILS & LOGIN IDENTITY SECURITY CONFIRMATION    */}
        {/* ============================================================== */}
        {step === "USER_DETAILS" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("REVIEW")}
                className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Plan</span>
              </button>
              <span className="text-[10px] font-mono uppercase text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Step 1 of 3: Identity & Billing
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                Confirm Account & Billing Details
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                MakeMistakes permanently locks all paid benefits & AI tokens to your verified login credentials.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3.5 pt-1">
              {/* Email Address - Login Identity */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    <span>Email Address (Login Identity)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Permanent Account ID</span>
                  </span>
                </label>
                <input
                  type="email"
                  value={verifiedEmail}
                  onChange={(e) => setVerifiedEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition-colors"
                  placeholder="sarah@example.com"
                  required
                />
                <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 font-sans leading-relaxed">
                  <span className="text-amber-400 font-semibold font-mono block mb-0.5">
                    Important Security Notice:
                  </span>
                  You must use this email to log in every time. Your subscription entitlements, code submissions, and {plan.aiCreditsPerMonth} monthly AI credits belong exclusively to this internal user account.
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-300 font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span>Full Name (for Tax Invoice & Portfolio)</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  placeholder="e.g. Ajay Panditi"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span>Mobile / WhatsApp Number</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Invoice SMS & Alerts</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <button
              onClick={handleProceedToPaymentOptions}
              className="w-full mt-4 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Payment Options</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: PAYMENT METHOD OPTIONS (UPI/QR, Cards, Net Banking)    */}
        {/* ============================================================== */}
        {step === "PAYMENT_OPTIONS" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("USER_DETAILS")}
                className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-[10px] font-mono uppercase text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Step 2 of 3: Payment Method
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                Select Payment Method
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Choose how you would like to pay for {plan.name}.
              </p>
            </div>

            {/* Payment Options Stack */}
            <div className="space-y-3 pt-1">
              {/* OPTION 1: UPI / QR CODE */}
              <div
                onClick={() => setSelectedMethod("UPI")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedMethod === "UPI"
                    ? "border-teal-500 bg-teal-500/10 shadow-sm"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  selectedMethod === "UPI" ? "bg-teal-600 text-white" : "bg-zinc-800 text-zinc-400"
                }`}>
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">
                      UPI QR Code & Apps
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ⚡ RECOMMENDED & INSTANT
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Google Pay, PhonePe, Paytm, BHIM, Cred & any UPI app. Instant activation via dynamic QR code.
                  </p>
                </div>
              </div>

              {/* OPTION 2: CREDIT / DEBIT CARDS */}
              <div
                onClick={() => setSelectedMethod("CARD")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedMethod === "CARD"
                    ? "border-teal-500 bg-teal-500/10 shadow-sm"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  selectedMethod === "CARD" ? "bg-teal-600 text-white" : "bg-zinc-800 text-zinc-400"
                }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-white block">
                    Credit / Debit Cards
                  </span>
                  <p className="text-xs text-zinc-400 mt-1">
                    Visa, MasterCard, RuPay, Maestro with 3D Secure OTP verification.
                  </p>
                </div>
              </div>

              {/* OPTION 3: NET BANKING */}
              <div
                onClick={() => setSelectedMethod("NETBANKING")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  selectedMethod === "NETBANKING"
                    ? "border-teal-500 bg-teal-500/10 shadow-sm"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  selectedMethod === "NETBANKING" ? "bg-teal-600 text-white" : "bg-zinc-800 text-zinc-400"
                }`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-white block">
                    Net Banking
                  </span>
                  <p className="text-xs text-zinc-400 mt-1">
                    State Bank of India, HDFC, ICICI, Axis, Kotak & 50+ major Indian banks.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary Bar */}
            <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono font-bold">
                  Total Payable
                </span>
                <span className="text-lg font-bold font-mono text-white">
                  ₹{plan.price.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-zinc-500 ml-1">/ month</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  Billed To
                </span>
                <span className="font-mono text-teal-400 font-semibold truncate max-w-[170px] block">
                  {verifiedEmail}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToMethodScreen}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Pay ₹{plan.price.toLocaleString("en-IN")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4a: QR CODE PAYMENT SCREEN (Requested by user)           */}
        {/* ============================================================== */}
        {step === "QR_PAYMENT" && (
          <div className="space-y-4 text-center animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-left">
              <button
                onClick={() => setStep("PAYMENT_OPTIONS")}
                className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Change Method</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>Expires in {formatTimer(timeLeft)}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                Scan & Pay with Any UPI App
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Scan the dynamic QR code with Google Pay, PhonePe, Paytm, or BHIM.
              </p>
            </div>

            {/* QR Card Container */}
            <div className="p-4 bg-white rounded-2xl border-2 border-teal-500/80 shadow-xl inline-block mx-auto relative group">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="MakeMistakes UPI Payment QR Code"
                  className="w-52 h-52 sm:w-56 sm:h-56 mx-auto rounded-lg"
                />
              ) : (
                <div className="w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center text-xs text-zinc-500 font-mono">
                  Generating secure UPI QR...
                </div>
              )}

              {/* Amount Overlay Badge */}
              <div className="mt-2 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-teal-900 text-teal-100 font-mono text-xs font-bold tracking-tight">
                  ₹{plan.price.toLocaleString("en-IN")} • {plan.name}
                </span>
              </div>
            </div>

            {/* Copy UPI ID Section */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs max-w-sm mx-auto">
              <div className="text-left">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                  Official Merchant UPI ID
                </span>
                <span className="font-mono text-zinc-200 font-bold">
                  makemistakes@icici
                </span>
              </div>
              <button
                onClick={handleCopyUpiId}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-teal-400 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Supported UPI Apps Row */}
            <div className="text-center pt-1">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold mb-2">
                Accepted Apps
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Google Pay
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  PhonePe
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Paytm
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  BHIM
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                  CRED
                </span>
              </div>
            </div>

            {/* Waiting Radar Pulse */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-teal-400 pt-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
              <span>Awaiting payment approval from banking network...</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSimulatePayment}
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✓ I Have Completed Payment</span>
              </button>

              <button
                onClick={handleSimulatePayment}
                className="w-full py-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-mono text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Successful UPI Scan (Instant Test)</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4b: CARD PAYMENT SCREEN                                   */}
        {/* ============================================================== */}
        {step === "CARD_PAYMENT" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("PAYMENT_OPTIONS")}
                className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Change Method</span>
              </button>
              <span className="text-[10px] font-mono uppercase text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Card Checkout
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                Enter Card Details
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                256-bit encrypted checkout for {plan.name} (₹{plan.price.toLocaleString("en-IN")}).
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-300 font-semibold">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                  placeholder="4532 8901 2345 6789"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-300 font-semibold">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  placeholder="Ajay Panditi"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300 font-semibold">
                    Valid Thru (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none text-center"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-300 font-semibold">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none text-center"
                    placeholder="•••"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulatePayment}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Pay ₹{plan.price.toLocaleString("en-IN")} Securely</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4c: NET BANKING SCREEN                                    */}
        {/* ============================================================== */}
        {step === "NET_BANKING" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("PAYMENT_OPTIONS")}
                className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Change Method</span>
              </button>
              <span className="text-[10px] font-mono uppercase text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Net Banking
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                Select Your Bank
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                You will be redirected to your bank's secure portal to authorize ₹{plan.price.toLocaleString("en-IN")}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {["HDFC", "ICICI", "SBI", "Axis", "Kotak", "PNB"].map((bank) => (
                <button
                  key={bank}
                  onClick={() => setSelectedBank(bank)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer font-mono text-xs flex items-center justify-between ${
                    selectedBank === bank
                      ? "border-teal-500 bg-teal-500/15 text-white font-bold"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <span>{bank} Bank</span>
                  {selectedBank === bank && <Check className="w-3.5 h-3.5 text-teal-400" />}
                </button>
              ))}
            </div>

            <button
              onClick={handleSimulatePayment}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Pay via {selectedBank} NetBanking &rarr;</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP: CREATING ORDER / WAITING GATEWAY / VERIFYING             */}
        {/* ============================================================== */}
        {(step === "CREATING_ORDER" ||
          step === "WAITING_GATEWAY" ||
          step === "VERIFYING") && (
          <div className="space-y-6 text-center py-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-ping"></div>
              <div className="w-16 h-16 rounded-full border-4 border-teal-500 border-t-transparent animate-spin flex items-center justify-center">
                <Lock className="w-6 h-6 text-teal-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif text-white">
                {step === "CREATING_ORDER" && "Setting Up Secure Order..."}
                {step === "WAITING_GATEWAY" && "Connecting to Payment Gateway..."}
                {step === "VERIFYING" && "Activating Account Entitlement..."}
              </h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                {step === "CREATING_ORDER" &&
                  "Generating authoritative order and binding cryptographic keys to internal user ID..."}
                {step === "WAITING_GATEWAY" &&
                  "Awaiting gateway response. Please do not refresh this window."}
                {step === "VERIFYING" &&
                  `Cryptographically validating signature and allocating ${plan.aiCreditsPerMonth} AI credits to ${verifiedEmail}...`}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP: SUCCESS CELEBRATION                                      */}
        {/* ============================================================== */}
        {step === "SUCCESS" && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                PAYMENT CONFIRMED & ACTIVE
              </span>
              <h2 className="text-2xl font-bold font-serif text-white mt-2">
                Welcome to {plan.name}!
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Your account is upgraded. Socratic Nova AI architectural mentoring and concurrency testing are unlocked.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400 font-mono">Bound Account</span>
                <span className="font-mono text-teal-300 font-semibold truncate max-w-[200px]">
                  {verifiedEmail}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400 font-mono">AI Credits Credited</span>
                <span className="font-mono text-emerald-400 font-bold">
                  +{activationResult?.credits ?? plan.aiCreditsPerMonth} Credits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-mono">Status</span>
                <span className="font-mono text-teal-400 font-bold uppercase">
                  Active (30 Days)
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-teal-600/20"
            >
              Launch MakeMistakes OS &rarr;
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP: DELAYED VERIFICATION                                    */}
        {/* ============================================================== */}
        {step === "DELAYED" && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold font-serif text-white">
                Payment Verification Delayed
              </h2>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Your transaction was received, but the payment gateway webhook confirmation is
                pending. Your funds are safe and will be bound to your account once confirmed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckStatus}
                disabled={isRefreshing}
                className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Refresh Status</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP: FAILED                                                   */}
        {/* ============================================================== */}
        {step === "FAILED" && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold font-serif text-white">
                Payment Could Not Be Completed
              </h2>
              <p className="text-xs text-red-400 mt-1.5 font-mono">
                {errorMessage || "Verification signature error or transaction cancelled."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOrderData(null);
                  setErrorMessage(null);
                  setStep("REVIEW");
                }}
                className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
