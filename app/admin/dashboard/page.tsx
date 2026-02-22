import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-3xl font-extrabold text-green-900 mb-4">Superadmin Dashboard</h1>
        <p className="text-gray-700 font-semibold mb-6">
          Bienvenue, superadmin ! Gérez les demandes, les comptes et les fermes depuis ce tableau de bord.
        </p>
        <div className="grid gap-4">
          <Link href="/admin/requests">
            <button className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-extrabold shadow">
              Gérer les demandes d'inscription
            </button>
          </Link>
          {/* Ajoute ici d'autres liens ou widgets admin */}
        </div>
      </div>
    </main>
  );
}
