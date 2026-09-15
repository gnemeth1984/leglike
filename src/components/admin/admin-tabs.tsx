"use client";

import { useState, type ReactNode } from "react";
import { SeoTab } from "@/components/admin/seo-tab";

export function AdminTabs({ usersPanel }: { usersPanel: ReactNode }) {
  const [tab, setTab] = useState<"users" | "seo">("users");

  return (
    <div>
      <div className="mb-8 flex gap-2 border-b border-neutral-800">
        {[
          { id: "users" as const, label: "Users" },
          { id: "seo" as const, label: "SEO Autopilot" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "border-b-2 border-lime-400 text-lime-400"
                : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" ? usersPanel : <SeoTab />}
    </div>
  );
}
