"use client";

import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    desc: "For project demo / small farms",
    features: ["Weather API", "1 zone", "Basic alerts", "Dashboard view"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "49 TND / month",
    desc: "Best for real farms (recommended)",
    features: ["2 zones", "Smart irrigation rules", "Advanced alerts", "Reports"],
    cta: "Buy Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For large farms & integrations",
    features: ["Robot integration", "Custom AI models", "24/7 support", "Custom dashboard"],
    cta: "Request Demo",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F7F8F4]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Pricing & Offers</h1>
            <p className="mt-3 text-gray-600 font-semibold max-w-2xl">
              Choose the offer that matches your farm. For now everything is static (demo), later
              we connect payment + database.
            </p>
          </div>

          <Link href="/" className="font-extrabold text-green-800 hover:text-green-900">
            ← Back to Home
          </Link>
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl border bg-white shadow p-8 relative ${
                p.popular ? "border-green-500 ring-2 ring-green-200" : "border-gray-200"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 right-6 bg-green-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-sm font-extrabold text-green-700">PLAN</div>
              <div className="mt-2 text-2xl font-extrabold text-gray-900">{p.name}</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900">{p.price}</div>
              <p className="mt-3 text-gray-600 font-semibold">{p.desc}</p>

              <ul className="mt-6 grid gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-700 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={`/purchase?plan=${encodeURIComponent(p.name)}`} className="mt-8 block">
                <button
                  className={`w-full px-6 py-3 rounded-xl font-extrabold transition shadow ${
                    p.popular
                      ? "bg-green-700 text-white hover:bg-green-800"
                      : "bg-gray-900 text-white hover:bg-black"
                  }`}
                >
                  {p.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl bg-white border border-gray-200 shadow p-8">
          <h2 className="text-2xl font-extrabold text-gray-900">What happens next?</h2>
          <p className="mt-2 text-gray-600 font-semibold">
            When a visitor clicks “Buy / Request Demo”, they go to a form page. For now, we just
            show a success message (no DB). Later we store requests in DB.
          </p>
        </div>
      </div>
    </main>
  );
}
