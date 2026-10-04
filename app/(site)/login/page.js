import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next || "/tickets");
  return <LoginForm next={next || "/tickets"} />;
}
