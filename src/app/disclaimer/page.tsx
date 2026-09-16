import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Medical Disclaimer — LegLike",
  description: "LegLike is not a substitute for professional medical advice.",
  robots: { index: false, follow: true },
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16 text-neutral-300">
        <h1 className="mb-2 text-3xl font-bold text-white">Medical &amp; Fitness Disclaimer</h1>
        <p className="mb-10 text-sm text-neutral-500">
          This disclaimer is part of our{" "}
          <Link href="/terms" className="text-lime-400 hover:underline">Terms &amp; Conditions</Link>.
        </p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
            <p className="font-semibold text-amber-300">
              LegLike is not a medical device, and does not provide medical advice, diagnosis, or treatment.
            </p>
          </section>

          <p>
            LegLike generates workout, mobility, and rehabilitation exercise suggestions using
            automated, AI-assisted tools based on information you enter, including self-reported
            pain areas and injury history. These suggestions are for general informational and
            educational purposes only. They are not a substitute for professional medical advice,
            physical therapy, diagnosis, or treatment from a qualified physician, physiotherapist,
            or other licensed healthcare provider.
          </p>

          <p>You should consult a qualified healthcare professional before starting any new exercise, mobility, or rehabilitation program, particularly if you:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>have had a recent surgery, fracture, or acute injury,</li>
            <li>experience severe, worsening, or unexplained pain,</li>
            <li>have a diagnosed medical condition that could be affected by exercise,</li>
            <li>are pregnant, or</li>
            <li>are unsure whether an exercise is appropriate for your condition.</li>
          </ul>

          <p>
            Stop any exercise immediately and seek medical attention if you experience sharp pain,
            dizziness, chest pain, shortness of breath, or any other concerning symptom.
          </p>

          <p>
            By using LegLike, you acknowledge that physical exercise carries inherent risk of
            injury, that you are using the Service voluntarily and at your own risk, and that
            LegLike, its operators, and contributors are not liable for any injury, loss, or
            damage arising from your use of the Service or reliance on any AI-generated plan. See
            our{" "}
            <Link href="/terms" className="text-lime-400 hover:underline">Terms &amp; Conditions</Link>{" "}
            for the full liability terms.
          </p>

          <p>
            If you have questions about a plan or believe it does not fit your condition, stop
            using it and consult a professional. You can also reach us through our{" "}
            <Link href="/contact" className="text-lime-400 hover:underline">Contact form</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
