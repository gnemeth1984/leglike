"use client";

import { useState, type ReactNode } from "react";
import { SeoTab } from "@/components/admin/seo-tab";

export function AdminTabs({
  usersPanel,
  messagesPanel,
}: {
  usersPanel: ReactNode;
  messagesPanel: ReactNode;
}) {
  const [tab, setTab] = useState<"users" | "seo" | "messages">("users");

  return (
    <div>
      <div className="mb-8 flex gap-2 border-b border-neutral-800">
        {[
          { id: "users" as const, label: "Users" },
          { id: "messages" as const, label: "Messages" },
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

      {tab === "users" ? usersPanel : tab === "messages" ? messagesPanel : <SeoTab />}
    </div>
  );
}
