import { useState, useRef, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Shield, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PhoneOtpVerificationProps {
  onVerified: (phone: string, firebaseToken: string) => void;
}

type Step = "phone" | "otp";

export default function PhoneOtpVerification({ onVerified }: PhoneOtpVerificationProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const initRecaptcha = () => {
    // Clear any previous verifier
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
    if (!recaptchaContainerRef.current) return;
    recaptchaVerifierRef.current = new RecaptchaVerifier(
      firebaseAuth,
      recaptchaContainerRef.current,
      {
        size: "invisible",
        callback: () => {},
      }
    );
  };

  const formatPhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, "");
    // If starts with 0, replace with +91
    if (digits.startsWith("0")) return "+91" + digits.slice(1);
    // If 10 digits (Indian), prepend +91
    if (digits.length === 10) return "+91" + digits;
    // If already has country code
    if (digits.startsWith("91") && digits.length === 12) return "+" + digits;
    // Otherwise assume international with +
    return "+" + digits;
  };

  const sendOtp = async () => {
    const formatted = formatPhone(phone);
    if (formatted.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    setLoading(true);
    try {
      initRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        firebaseAuth,
        formatted,
        recaptchaVerifierRef.current!
      );
      confirmationRef.current = confirmation;
      setStep("otp");
      setCountdown(60);
      toast.success(`OTP sent to ${formatted}`);
    } catch (err: any) {
      console.error("OTP send error:", err);
      if (err.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again after some time.");
      } else if (err.code === "auth/invalid-phone-number") {
        toast.error("Invalid phone number. Please check and try again.");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    if (!confirmationRef.current) {
      toast.error("Session expired. Please request a new OTP.");
      setStep("phone");
      return;
    }
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(otp);
      const token = await result.user.getIdToken();
      const formatted = formatPhone(phone);
      onVerified(formatted, token);
      toast.success("Phone number verified!");
    } catch (err: any) {
      console.error("OTP verify error:", err);
      if (err.code === "auth/invalid-verification-code") {
        toast.error("Incorrect OTP. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        toast.error("OTP expired. Please request a new one.");
        setStep("phone");
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setOtp("");
    await sendOtp();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-lg">
      {/* Invisible reCAPTCHA container */}
      <div ref={recaptchaContainerRef} id="recaptcha-container" />

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          {step === "phone" ? (
            <Phone className="h-8 w-8 text-primary" />
          ) : (
            <Shield className="h-8 w-8 text-primary" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {step === "phone" ? "Verify Your Mobile" : "Enter OTP"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {step === "phone"
            ? "We'll send a one-time password to your mobile number to verify your identity."
            : `Enter the 6-digit OTP sent to ${formatPhone(phone)}`}
        </p>
      </div>

      {step === "phone" ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Mobile Number
            </Label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 text-foreground"
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                autoComplete="tel"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Indian numbers: enter 10 digits (e.g. 9876543210). International: include country code.
            </p>
          </div>
          <Button
            onClick={sendOtp}
            disabled={loading || phone.length < 10}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>

          {/* Trust note */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 rounded-lg p-3">
            <Shield className="h-4 w-4 shrink-0 text-green-500" />
            <span>Your number is used only for verification and is never shown publicly.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="otp" className="text-sm font-medium">
              6-Digit OTP
            </Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1.5 text-center text-2xl tracking-[0.5em] font-mono text-foreground"
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
              autoFocus
            />
          </div>

          <Button
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend OTP in <span className="font-semibold text-foreground">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={resendOtp}
                className="text-sm text-primary hover:underline font-medium"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            onClick={() => { setStep("phone"); setOtp(""); }}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Change phone number
          </button>
        </div>
      )}
    </div>
  );
}
