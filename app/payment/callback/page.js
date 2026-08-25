import { redirect } from "next/navigation";
import PaymentCallback from "@/components/PaymentCallback";

export const dynamic = "force-dynamic";

export default async function PaymentCallbackPage({ searchParams }) {
  const { reference, simulate } = await searchParams;
  if (!reference) redirect("/tickets");
  return <PaymentCallback reference={reference} simulate={simulate} />;
}
