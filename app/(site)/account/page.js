import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm, PasswordForm } from "@/components/AccountForms";

export const metadata = { title: "My account — Lagos OTRS" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const incomplete = !user.address || !user.nextOfKinPhone;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">My account</h1>
        <p className="text-sm text-muted">
          {user.role === "admin"
            ? "Administrator account."
            : "Your details and password."}
        </p>
      </div>

      {incomplete && (
        <div className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Please add your home address and a next-of-kin phone contact. We ask
          for these so we can reach someone on your behalf in an emergency.
        </div>
      )}

      <ProfileForm
        user={{
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          nextOfKinName: user.nextOfKinName,
          nextOfKinPhone: user.nextOfKinPhone,
        }}
      />

      <PasswordForm />

      {user.role === "admin" && (
        <p className="text-center text-sm text-muted">
          <Link href="/admin" className="font-semibold text-brand-700 hover:underline">
            Back to the administration area
          </Link>
        </p>
      )}
    </div>
  );
}
