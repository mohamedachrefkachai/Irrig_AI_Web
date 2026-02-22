import Link from "next/link";

export default function PendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-yellow-50">
      <div className="rounded-2xl border border-yellow-200 bg-white p-10 shadow max-w-md">
        <h1 className="text-2xl font-extrabold text-yellow-700 mb-4">Account Pending Approval</h1>
        <p className="text-gray-700 font-semibold mb-6">
          Your account is pending admin approval. You will be notified once approved.
        </p>
        <Link href="/">
          <button className="bg-yellow-700 hover:bg-yellow-800 text-white px-6 py-3 rounded-xl font-extrabold shadow">
            Back to Home
          </button>
        </Link>
      </div>
    </main>
  );
}
