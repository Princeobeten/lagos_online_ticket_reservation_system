import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = { title: "Reset password — Lagos OTRS" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token || ""} />;
}
