"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function PurchasePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F7F8F4]" />}>
      <PurchaseContent />
    </Suspense>
  );
}

function PurchaseContent() {
  const sp = useSearchParams();
  const plan = useMemo(() => sp.get("plan") || "Pro", [sp]);

  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      fullName: form.elements[0].value,
      farmName: form.elements[1].value,
      email: form.elements[2].value,
      phone: form.elements[3].value,
      city: form.elements[4].value,
      area: form.elements[5].value,
      message: form.elements[6].value,
      password: "azerty123", // à remplacer par un vrai champ si tu veux
      confirmPassword: "azerty123"
    };
    fetch("/api/purchase-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(() => setSent(true));
  }

  return (
    <main className="min-h-screen bg-[#F7F8F4]">
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-16">
        <Link href="/pricing" className="font-extrabold text-green-800 hover:text-green-900">
          ← Back to Offers
        </Link>

        <div className="mt-6 rounded-3xl bg-white border border-gray-200 shadow p-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Request / Purchase: <span className="text-green-700">{plan}</span>
          </h1>
          <p className="mt-2 text-gray-600 font-semibold">
            Fill the form. For now it is static (demo). Later we&apos;ll connect database & email.
          </p>

          {sent ? (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
              <div className="font-extrabold text-green-900 text-lg">Request sent!</div>
              <p className="mt-2 text-green-900/80 font-semibold">
                We received your request (demo). Next step: save it in DB + send confirmation
                email.
              </p>
              <div className="mt-5 flex gap-3 flex-wrap">
                <Link href="/">
                  <button className="bg-green-700 hover:bg-green-800 transition text-white px-6 py-3 rounded-xl font-extrabold shadow">
                    Back to Home
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="border border-gray-300 hover:bg-gray-50 transition px-6 py-3 rounded-xl font-extrabold">
                    See offers
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 grid gap-5">
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Full name" placeholder="Your name" />
                <Field label="Company / Farm name" placeholder="Farm name" />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Email" placeholder="you@email.com" type="email" />
                <Field label="Phone" placeholder="+216 XX XXX XXX" />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Field label="City" placeholder="Tunis, Sfax, ..." />
                <Field label="Farm size (ha)" placeholder="e.g. 5" />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-gray-900 mb-2">
                  Message (optional)
                </label>
                <textarea
                  className="w-full rounded-2xl border border-gray-200 bg-white p-4 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
                  rows={4}
                  placeholder="Tell us your needs: crops, zones, robot, etc."
                />
              </div>

              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 transition text-white px-7 py-3 rounded-2xl font-extrabold shadow focus:outline-none focus:ring-2 focus:ring-green-300/60"
              >
                Submit Request
              </button>

              <p className="text-xs text-gray-500 font-semibold">
                Demo mode: no payment, no database. Next version will store requests and send
                email.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-extrabold text-gray-900 mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-green-300/60"
      />
    </div>
  );
}
