import ForgotPasswordForm from "../../components/ForgotPasswordForm";

export default function AdminForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      title="Admin forgot password"
      description="Enter your admin email and we’ll send a reset link."
      backLink="/admin/login"
      backText="← Back to admin login"
      alternateLink="/forgot-password"
      alternateText="Resident forgot password →"
    />
  );
}