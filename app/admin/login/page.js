import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Administrator sign in — Lagos OTRS" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }) {
  const { denied } = await searchParams;
  const user = await getCurrentUser().catch(() => null);
  if (user?.role === "admin") redirect("/admin");

  return <AdminLoginForm denied={Boolean(denied)} />;
}
