import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact — LegLike",
  description: "Reach LegLike for support, privacy requests, or legal questions.",
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold text-white">Contact us</h1>
        <p className="mb-8 text-sm text-neutral-400">
          We don&apos;t publish a public email address yet — send us a message here instead,
          including privacy or data requests under our{" "}
          <a href="/privacy" className="text-lime-400 hover:underline">Privacy Policy</a>.
        </p>
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
