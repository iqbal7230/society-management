import ForgotPasswordForm from "../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      title="Forgot password"
      description="Enter your email and we’ll send a reset link."
      backLink="/login"
      backText="← Back to login"
      alternateLink="/admin/forgot-password"
      alternateText="Admin forgot password →"
    />
  );
}