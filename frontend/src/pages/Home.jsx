import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className=" text-[#0F172A] min-h-screen flex flex-col">
      {/* ================= HERO ================= */}
      {/* <header className="w-full py-6 px-6 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          NextGenCRM
        </h1>
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <a href="#features" className="hover:text-blue-400 transition">
            Features
          </a>
          <a href="#about" className="hover:text-blue-400 transition">
            About
          </a>
          <a href="#contact" className="hover:text-blue-400 transition">
            Contact
          </a>
        </nav>
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="text-sm px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition"
          >
            Get Started
          </Link>
        </div>
      </header> */}

      {/* ================= HERO SECTION ================= */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-16">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Empower Your Business with{" "}
          <span className="bg-linear-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
            NextGenCRM
          </span>
        </h2>
        <p className="max-w-2xl text-gray-400 text-lg mb-8">
          Simplify client management, automate workflows, and unlock growth
          insights with the most powerful CRM designed for modern teams.
        </p>
        <Link
          to="/signup"
          className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-lg text-lg font-medium hover:scale-105 transition-transform"
        >
          Start Free Trial <ArrowRight size={18} />
        </Link>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="py-20 px-6 bg-blue-300 text-center border-t border-gray-800"
      >
        <h3 className="text-3xl font-bold mb-12">Why Choose NextGenCRM?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              title: "Smart Automation",
              desc: "Automate repetitive tasks, follow-ups, and reports to save time and boost efficiency.",
            },
            {
              title: "Real-Time Analytics",
              desc: "Visualize customer insights, track team performance, and measure success in real-time.",
            },
            {
              title: "Seamless Collaboration",
              desc: "Bring your sales, marketing, and support teams together on one unified platform.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-gray-900 hover:bg-gray-800 transition"
            >
              <h4 className="text-xl font-semibold mb-3 text-blue-400">
                {f.title}
              </h4>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="py-20 px-6 text-center">
        <h3 className="text-3xl font-bold mb-6">Built for Modern Businesses</h3>
        <p className="max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed">
          NextGenCRM helps businesses centralize customer relationships,
          automate key workflows, and make data-driven decisions — all from a
          single intuitive interface. It’s fast, scalable, and built to help
          teams grow together.
        </p>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 px-6 bg-linear-to-r from-blue-600 to-purple-600 text-center">
        <h3 className="text-3xl font-bold mb-6">
          Ready to revolutionize your customer management?
        </h3>
        <Link
          to="/signup"
          className="bg-white text-gray-900 font-medium px-8 py-3 rounded-lg hover:bg-gray-200 transition"
        >
          Get Started Today
        </Link>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-8 text-center text-gray-500 border-t border-gray-800 text-sm">
        © {new Date().getFullYear()} NextGenCRM. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
