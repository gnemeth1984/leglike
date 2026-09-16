import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms & Conditions — LegLike",
  description: "The terms that govern your use of LegLike.",
  robots: { index: false, follow: true },
};

const LAST_UPDATED = "September 16, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16 text-neutral-300">
        <h1 className="mb-2 text-3xl font-bold text-white">Terms &amp; Conditions</h1>
        <p className="mb-10 text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <p>
              These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of
              leglike.com and the LegLike application (the &quot;Service&quot;), operated by the
              individual or team currently operating LegLike (&quot;LegLike,&quot; &quot;we,&quot;
              &quot;us&quot;). LegLike is not yet operated through a formally incorporated
              company; these Terms apply to whoever operates the Service at a given time,
              including a future owner if the Service is transferred or sold. By creating an
              account or using the Service, you agree to these Terms, our{" "}
              <Link href="/privacy" className="text-lime-400 hover:underline">Privacy Policy</Link>
              , and our{" "}
              <Link href="/disclaimer" className="text-lime-400 hover:underline">Medical Disclaimer</Link>. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">1. Eligibility &amp; accounts</h2>
            <p>
              You must be at least 16 years old to use the Service. You are responsible for the
              accuracy of the information you provide and for keeping your login credentials
              confidential. You are responsible for all activity under your account.
            </p>
          </section>

          <section id="medical-disclaimer" className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
            <h2 className="mb-3 text-lg font-semibold text-amber-300">
              2. Medical &amp; fitness disclaimer — please read
            </h2>
            <p className="mb-3">
              <strong>LegLike is not a medical device and does not provide medical advice.</strong>{" "}
              Workout, mobility, and rehabilitation plans are generated using automated,
              AI-assisted tools based on information you self-report, including pain areas and
              injury history. They are general, informational suggestions only, and are not a
              substitute for diagnosis, treatment, or advice from a licensed physician,
              physiotherapist, or other qualified healthcare professional.
            </p>
            <p className="mb-3">
              You should consult a healthcare professional before starting any new exercise or
              rehab program, especially if you have a recent injury or surgery, a diagnosed
              medical condition, severe or worsening pain, or are pregnant. Stop exercising and
              seek medical attention if you experience sharp pain, dizziness, chest pain, or
              shortness of breath.
            </p>
            <p>
              You use the Service and any AI-generated plan voluntarily and entirely at your own
              risk. To the fullest extent permitted by law, you release and waive any claim
              against LegLike and its operators for injury, loss, or damage arising from your use
              of the Service or reliance on any plan or recommendation it produces. See the full{" "}
              <Link href="/disclaimer" className="text-lime-400 hover:underline">Medical Disclaimer</Link>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">3. AI-generated content</h2>
            <p>
              Workout plans, rehab plans, and recommendations are generated with the assistance
              of artificial intelligence based on the information you provide. AI-generated
              content can be incomplete, generic, or in rare cases inaccurate. You are responsible
              for using your own judgment, and for stopping and seeking professional advice if a
              plan seems inappropriate for your condition.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">4. Plans &amp; billing</h2>
            <p>
              LegLike currently offers Free, Pro, and Clinic plans as described on our{" "}
              <Link href="/pricing" className="text-lime-400 hover:underline">Pricing page</Link>.
              Paid billing is not yet live on the Service; where a paid plan is offered before
              billing is enabled, no charge will be made until payment processing is active and
              you have been clearly notified. Once paid plans go live, we will update these Terms
              with the applicable billing, renewal, and cancellation terms, and you will be able
              to review them before being charged.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">5. Acceptable use</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Do not use the Service for any unlawful purpose or to harm others.</li>
              <li>Do not attempt to reverse-engineer, scrape, or disrupt the Service.</li>
              <li>Do not misrepresent your identity or share your account with others.</li>
              <li>Do not upload content that is unlawful, abusive, or infringes another&apos;s rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">6. Intellectual property</h2>
            <p>
              The Service, its design, and its underlying software are owned by LegLike or its
              licensors. You retain ownership of the personal information you submit, and we
              grant you a personal, non-exclusive license to use any plan generated for you for
              your own personal fitness purposes. You may not resell or redistribute
              AI-generated plans as your own commercial product without our permission.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">7. Termination</h2>
            <p>
              You may stop using the Service and request deletion of your account at any time
              through our{" "}
              <Link href="/contact" className="text-lime-400 hover:underline">Contact form</Link>. We may suspend or terminate accounts that violate these Terms, misuse the Service, or pose a risk to it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">8. Disclaimer of warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available,&quot; without
              warranties of any kind, express or implied, including fitness for a particular
              purpose, accuracy, or non-infringement.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">9. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, LegLike and its operators will not be
              liable for any indirect, incidental, special, consequential, or punitive damages,
              or any loss of data, injury, or health outcome, arising from your use of the
              Service, including reliance on any AI-generated workout or rehab plan. Where
              liability cannot be fully excluded by law, our total liability is limited to the
              amount you paid us, if any, in the twelve months before the claim.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">10. Changes to the Service or these Terms</h2>
            <p>
              We may update the Service or these Terms from time to time. We will update the
              &quot;Last updated&quot; date above, and for material changes, provide reasonable
              notice within the Service. Continued use after a change means you accept the
              updated Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">11. Transfer of the Service</h2>
            <p>
              LegLike may be sold, transferred, or assigned to another operator. These Terms, our
              Privacy Policy, and our Medical Disclaimer will continue to apply to your account
              under the new operator unless you are notified of a material change.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">12. Contact</h2>
            <p>
              We do not currently publish a company address or a public email address. For any
              question about these Terms, use our{" "}
              <Link href="/contact" className="text-lime-400 hover:underline">Contact form</Link>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
