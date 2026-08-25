import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

export default async function RegisterPage({ searchParams }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next || "/tickets");
  return <AuthForm mode="register" next={next || "/tickets"} />;
}
