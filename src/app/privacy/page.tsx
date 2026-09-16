import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy — LegLike",
  description: "How LegLike collects, uses, and protects your data.",
  robots: { index: false, follow: true },
};

const LAST_UPDATED = "September 16, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16 text-neutral-300">
        <h1 className="mb-2 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-10 text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <p>
              LegLike (&quot;LegLike,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
              operates leglike.com and the LegLike application (the &quot;Service&quot;). LegLike
              is currently operated as an independent project and has not yet been
              incorporated as a formal legal entity. This Privacy Policy explains what
              information we collect, why we collect it, how it is used and protected, and
              the rights you have over it. If ownership or operation of the Service transfers
              to another operator, this Policy — or an updated version of it — will continue
              to govern your data, and we will notify users of any material change.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">1. Who this applies to</h2>
            <p>
              We do not currently restrict the Service to a specific country or region, and we
              have not yet determined every jurisdiction our users are located in. We aim to
              handle personal data — including data protected by regulations such as the EU/UK
              General Data Protection Regulation (GDPR), the California Consumer Privacy Act
              (CCPA/CPRA), and similar laws elsewhere — in a manner consistent with the
              principles those laws require: collect only what we need, use it only for the
              purposes described here, and let you access, correct, export, or delete it. We do
              not claim to have completed formal registration under any specific privacy
              regulator, and we will update this Policy as our legal structure and compliance
              obligations become clearer.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">2. Information we collect</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-neutral-100">Account information:</strong> name, email
                address, and a securely hashed password (we never store your password in plain
                text) when you register.
              </li>
              <li>
                <strong className="text-neutral-100">Health &amp; fitness information you provide:</strong>{" "}
                age, height, weight, activity level, fitness goals, self-reported pain areas,
                injury history, available equipment, and training frequency, collected during
                onboarding and used to personalize your plans.
              </li>
              <li>
                <strong className="text-neutral-100">Assessment &amp; plan data:</strong> mobility
                assessment scores (hip, knee, ankle, balance), and the AI-generated workout and
                rehab plans created for you, including the condition or region you describe when
                requesting a rehab plan.
              </li>
              <li>
                <strong className="text-neutral-100">Contact form submissions:</strong> your name,
                email, and message when you reach us through the{" "}
                <Link href="/contact" className="text-lime-400 hover:underline">Contact page</Link>.
              </li>
              <li>
                <strong className="text-neutral-100">Technical data:</strong> basic server logs
                (such as IP address and request timestamps) generated automatically by our
                hosting infrastructure for security and reliability. We do not currently use
                third-party advertising or analytics trackers, and this Policy will be updated
                if that changes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              3. Sensitive (health) data — special care
            </h2>
            <p>
              Some information you provide — pain areas, injury history, medical/physical
              conditions relevant to a rehab plan, and assessment results — is health-related
              personal data, treated as a special category of data under laws like the GDPR. We
              collect it only because you choose to enter it, only to generate and personalize
              your workout and rehab plans, and we do not sell it, and do not share it with
              advertisers or data brokers. You may decline to provide any of this information,
              though doing so will limit how well the Service can personalize your plans.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">4. How we use your data</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>To create your account and authenticate you when you sign in.</li>
              <li>
                To generate personalized workout plans, rehab plans, and mobility assessments,
                including by sending relevant profile data to our AI provider (see Section 5).
              </li>
              <li>To operate, maintain, and improve the Service, including troubleshooting bugs.</li>
              <li>To respond to messages you send through the Contact page.</li>
              <li>To meet legal obligations where they apply to us.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">5. Who can access your data</h2>
            <p>
              Your data is stored in our hosted database. A small number of authorized
              administrators of LegLike can view account and usage information (such as name,
              email, plan, and aggregate counts) through an internal admin dashboard, strictly
              to operate and support the Service — never to sell or advertise to you. To generate
              AI plans, relevant profile fields (such as goals, pain areas, and injury history)
              are sent to our third-party AI infrastructure provider solely to produce your
              plan; that provider processes the data under its own data-processing terms and
              does not use it to train models on our behalf beyond what is needed to serve the
              request. We use standard third-party infrastructure providers (hosting, database,
              and file storage) to run the Service; each processes data only as needed to
              provide that infrastructure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">6. Data retention</h2>
            <p>
              We retain your account and health-related data for as long as your account is
              active, so your plans and history remain available to you. If you delete your
              account or request deletion (see Section 8), we will delete or anonymize your
              personal data within a reasonable time, except where we are required to retain
              limited records for legal, security, or fraud-prevention purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">7. Cookies</h2>
            <p>
              We use only the minimal, strictly necessary cookies required to keep you signed in
              and to remember your session. We do not currently use third-party advertising or
              cross-site tracking cookies. If that changes, we will update this Policy and, where
              required by law, ask for your consent first.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">8. Your rights &amp; how to reach us</h2>
            <p>
              Depending on where you live, you may have the right to access, correct, export, or
              delete your personal data, or to object to or restrict certain processing. Because
              LegLike does not yet publish a company address, we handle all privacy requests
              through our in-app{" "}
              <Link href="/contact" className="text-lime-400 hover:underline">Contact form</Link>
              . Select &quot;Privacy&quot; as the category and describe your request; we will
              respond as soon as reasonably possible. You may also delete most of your own data
              directly from your account settings where available.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">9. Security</h2>
            <p>
              We use industry-standard measures — including password hashing and encrypted
              connections — to protect your data. No method of transmission or storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">10. Children</h2>
            <p>The Service is not directed to children under 16, and we do not knowingly collect data from them.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">11. Changes to this Policy</h2>
            <p>
              We may update this Policy as the Service, our legal structure, or applicable laws
              change. We will update the &quot;Last updated&quot; date above and, for material
              changes, provide reasonable notice within the Service.
            </p>
          </section>

          <section>
            <p>
              See also our{" "}
              <Link href="/terms" className="text-lime-400 hover:underline">Terms &amp; Conditions</Link>{" "}
              and{" "}
              <Link href="/disclaimer" className="text-lime-400 hover:underline">Medical Disclaimer</Link>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
