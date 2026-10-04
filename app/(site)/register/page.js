import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage({ searchParams }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next || "/tickets");
  return <RegisterForm next={next || "/tickets"} />;
}
