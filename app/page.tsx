"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Weather = { temp: number; desc: string; icon: string } | null;

export default function Home() {
  const [weather, setWeather] = useState<Weather>(null);
  const city = "Tunis";

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`/api/weather?city=${city}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.error) throw new Error(data.error);
        setWeather({ temp: data.temp, desc: data.desc, icon: data.icon });
      } catch {
        setWeather(null);
      }
    }
    fetchWeather();
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* ================= HERO ================= */}
      <header className="relative overflow-hidden min-h-screen flex items-center">

  {/* 🎥 VIDEO BACKGROUND */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="/farm.mp4" type="video/mp4" />
  </video>

  {/* DARK OVERLAY */}
  <div className="absolute inset-0 bg-gradient-to-b from-blue-950/80 via-blue-950/60 to-black/40" />

  <div className="relative z-10 w-full text-white">

    {/* NAV */}
    <nav className="w-full px-6 md:px-10 lg:px-14 py-6">
      <div className="flex items-center justify-between">
        <a href="#" className="text-3xl font-extrabold tracking-tight">
          Irrig&apos;Ai
        </a>

        <div className="hidden md:flex items-center gap-8 font-semibold text-lg">
          <a href="#features" className="hover:text-white/80 transition">Features</a>
          <a href="#solutions" className="hover:text-white/80 transition">Solutions</a>
          <a href="/pricing" className="hover:text-white/80 transition">Offers</a>
          <a href="#how" className="hover:text-white/80 transition">How it works</a>
          <a href="#faq" className="hover:text-white/80 transition">FAQ</a>
          <a href="#contact" className="hover:text-white/80 transition">Contact</a>
          <Link href="/login" className="hover:text-white/80 transition">Login</Link>
        </div>
      </div>
    </nav>

    {/* HERO CONTENT */}
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 md:py-24">

      <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur px-4 py-3 mb-6">
        <span>☀️</span>
        <div className="text-sm font-semibold">
          Weather in Tunis • 21°C
        </div>
      </div>

      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
        Smart Irrigation for Modern Farms 🌾
      </h1>

      <p className="mt-6 text-lg md:text-xl text-white/85">
        Irrig&apos;Ai combines AI, IoT and autonomous robots to reduce water
        waste, protect crops and increase productivity.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/login">
          <button className="bg-green-600 hover:bg-green-700 transition px-7 py-3 rounded-2xl text-lg font-extrabold shadow focus:outline-none focus:ring-2 focus:ring-green-300/60">
            Get Started
          </button>
        </Link>

        <a href="#solutions">
          <button className="border border-white/70 hover:bg-white/10 transition px-7 py-3 rounded-2xl text-lg font-extrabold focus:outline-none focus:ring-2 focus:ring-green-300/60">
            View Solutions
          </button>
        </a>
      </div>

      {/* TRUST BADGES */}
      <div className="mt-12 grid sm:grid-cols-3 gap-4">
        <TrustBadge title="Water Savings" desc="Up to 30% reduction" />
        <TrustBadge title="Real-time Alerts" desc="Instant anomalies" />
        <TrustBadge title="Easy Setup" desc="Start with API" />
      </div>

    </div>
  </div>

</header>


      {/* ================= FEATURES ================= */}
      <section id="features" className="py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="text-center">
            <p className="text-green-700 font-extrabold">WHY IRRIG&apos;AI</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold">A Commercial-Grade Smart Farming Platform</h2>
            <p className="mt-3 text-gray-600 font-semibold max-w-2xl mx-auto">
              Designed like a real product: clear value, strong UX, and scalable architecture.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <FeatureCard
              title="🤖 Autonomous Robot"
              desc="Moves through the farm, collects soil readings, supports field tasks."
            />
            <FeatureCard
              title="💧 Smart Water Control"
              desc="Automated valve control with zone logic and scheduling."
            />
            <FeatureCard
              title="📊 Real-Time Monitoring"
              desc="Dashboard + notifications for anomalies and failures."
            />
          </div>
        </div>
      </section>

      {/* ================= SOLUTIONS ================= */}
      <section id="solutions" className="py-16 bg-[#F7F8F4]">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-green-700 font-extrabold">SOLUTIONS</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold">
                Built for Water Efficiency & Sustainable Yield
              </h2>
              <p className="mt-3 text-gray-600 font-semibold max-w-2xl">
                Start simple (Weather API + basic valves) then evolve (robot + anomaly detection + AI models).
              </p>
            </div>
            <Link href="/login" className="font-extrabold text-green-800 hover:text-green-900">
              Explore Platform →
            </Link>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <ImageCard
              img="/irrigation.jpg"
              tag="Water"
              title="Precision Irrigation"
              icon="💧"
              desc="Control irrigation per zone based on soil + weather signals."
            />
            <ImageCard
              img="/robot.jpg"
              tag="Automation"
              title="Autonomous Robot"
              icon="🤖"
              highlight
              desc="Field data collection and emergency support actions."
            />
            <ImageCard
              img="/farmer.jpg"
              tag="Insights"
              title="Decision Support"
              icon="🧠"
              desc="Clear recommendations and alerts for quick decisions."
            />
          </div>

          {/* Stats row */}
          <div className="mt-10 rounded-3xl bg-white border border-gray-200 shadow">
            <div className="p-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatBig value="30%" label="Water saved" />
              <StatBig value="24/7" label="Monitoring" />
              <StatBig value="2" label="Zones supported" />
              <StatBig value="AI" label="Decisions + anomalies" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="text-center">
            <p className="text-green-700 font-extrabold">PROCESS</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold">How it works</h2>
            <p className="mt-3 text-gray-600 font-semibold max-w-2xl mx-auto">
              Collect data → AI decision → irrigate → monitor & alert.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <StepCard n="1" title="Collect" desc="Sensors + robot readings + weather Station" />
            <StepCard n="2" title="Decide" desc="AI predicts need and detects anomalies" />
            <StepCard n="3" title="Act & Monitor" desc="Valves ON/OFF + dashboard + alerts" />
          </div>

          {/* CTA band */}
          <div className="mt-12 rounded-3xl overflow-hidden border border-gray-200 shadow bg-white grid lg:grid-cols-2">
            <div
              className="min-h-[220px] bg-cover bg-center"
              style={{ backgroundImage: "url('/farm-field.jpg')" }}
            />
            <div className="p-10">
              <p className="text-green-700 font-extrabold">READY TO START?</p>
              <h3 className="mt-2 text-2xl md:text-3xl font-extrabold">
                Transform your farm with a modern, scalable platform.
              </h3>
              <p className="mt-3 text-gray-600 font-semibold">
                Begin with the essentials today — upgrade to full automation when ready.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login">
                  <button className="bg-green-700 hover:bg-green-800 transition text-white px-6 py-3 rounded-xl font-extrabold shadow focus:outline-none focus:ring-2 focus:ring-green-300/60">
                    Start Now
                  </button>
                </Link>
                <a href="#contact">
                  <button className="border border-gray-300 hover:bg-gray-50 transition px-6 py-3 rounded-xl font-extrabold focus:outline-none focus:ring-2 focus:ring-green-300/60">
                    Contact
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="py-16 bg-[#F7F8F4]">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="rounded-3xl bg-white border border-gray-200 shadow p-10">
            <h2 className="text-3xl font-extrabold">Frequently Asked Questions</h2>
            <div className="mt-6 grid gap-4">
              <FaqItem
                q="Does Irrig’Ai work for different crops?"
                a="Yes. You can adapt thresholds and schedules (olive, citrus, palm, etc.)."
              />
              <FaqItem
                q="Do I need a weather station?"
                a="No. You can start with a weather API, then add a local station later."
              />
              <FaqItem
                q="What happens if a valve fails?"
                a="You receive an alert and you can switch to manual control."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="rounded-3xl bg-white border border-gray-200 shadow p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold">Contact</h2>
              <p className="mt-2 text-gray-600 font-semibold">
                Email: contact@irrigai.tn (placeholder) • Phone: +216 XX XXX XXX
              </p>
              <p className="mt-2 text-gray-500 font-semibold">
                For PI presentation: you can mention Tunisia use-cases (olive farms, citrus, etc.).
              </p>
            </div>
            <Link href="/login">
              <button className="bg-green-700 hover:bg-green-800 transition text-white px-7 py-3 rounded-2xl font-extrabold shadow focus:outline-none focus:ring-2 focus:ring-green-300/60">
                Request Demo
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-green-900 text-white">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="font-extrabold text-xl">🌿 Irrig&apos;Ai</div>
            <p className="mt-2 text-white/80 font-semibold">
              Smart farming platform to optimize irrigation and reduce water waste.
            </p>
          </div>
          <div className="font-semibold text-white/85">
            <div className="font-extrabold mb-3">Links</div>
            <div className="grid gap-2">
              <a href="#features" className="hover:text-white">Features</a>
              <a href="#solutions" className="hover:text-white">Solutions</a>
              <a href="#how" className="hover:text-white">How it works</a>
              <a href="#faq" className="hover:text-white">FAQ</a>
            </div>
          </div>
          <div className="font-semibold text-white/85">
            <div className="font-extrabold mb-3">Project</div>
            <p className="text-white/80">
              PI-Dev / Irrig’Ai — demo interface (commercial style).
            </p>
          </div>
        </div>
        <div className="text-center text-white/70 font-semibold pb-6">
          © {year} Irrig&apos;Ai — All rights reserved
        </div>
      </footer>
    </main>
  );
}

/* ================= Components ================= */

function TrustBadge({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur px-5 py-4">
      <div className="font-extrabold">{title}</div>
      <div className="text-white/75 font-semibold text-sm mt-1">{desc}</div>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center">
      <div className="text-xl font-extrabold">{value}</div>
      <div className="text-xs font-semibold text-white/75">{label}</div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow hover:shadow-xl transition">
      <div className="text-lg font-extrabold">{title}</div>
      <p className="mt-3 text-gray-600 font-semibold">{desc}</p>
      <div className="mt-6 h-1.5 w-16 rounded-full bg-green-600" />
    </div>
  );
}

function StatBig({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="mt-2 text-gray-600 font-semibold">{label}</div>
    </div>
  );
}

function ImageCard({
  img,
  tag,
  title,
  icon,
  desc,
  highlight,
}: {
  img: string;
  tag: string;
  title: string;
  icon: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl overflow-hidden border shadow bg-white hover:shadow-xl transition ${
        highlight ? "border-green-500 ring-2 ring-green-200" : "border-gray-200"
      }`}
    >
      <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
      <div className="p-7">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold text-green-700">{tag}</div>
          <div className="text-xl">{icon}</div>
        </div>
        <div className="mt-2 text-xl font-extrabold">{title}</div>
        <p className="mt-3 text-gray-600 font-semibold">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow hover:shadow-xl transition">
      <div className="text-green-700 font-extrabold text-xl">Step {n}</div>
      <div className="mt-2 text-xl font-extrabold">{title}</div>
      <p className="mt-3 text-gray-600 font-semibold">{desc}</p>
      <div className="mt-6 flex items-center gap-2 text-sm font-extrabold text-gray-700">
        <span className="h-2 w-2 rounded-full bg-green-600" />
        Fast • Simple • Scalable
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-2xl bg-[#F7F8F4] border border-gray-200 p-5">
      <summary className="cursor-pointer font-extrabold">{q}</summary>
      <p className="mt-3 text-gray-600 font-semibold">{a}</p>
    </details>
  );
}
