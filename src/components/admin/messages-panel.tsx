import { Card } from "@/components/ui/card";

type Message = {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: string;
  createdAt: Date;
};

export function MessagesPanel({ messages }: { messages: Message[] }) {
  return (
    <Card>
      <h2 className="mb-4 font-semibold text-white">Contact Messages</h2>
      {messages.length === 0 ? (
        <p className="text-sm text-neutral-500">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="rounded-lg border border-neutral-800 p-4">
              <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
                <span>
                  <span className="font-medium text-neutral-300">{m.name}</span> — {m.email}
                </span>
                <span className="rounded-full bg-neutral-800 px-2 py-0.5">{m.category}</span>
              </div>
              <p className="mb-2 text-sm text-neutral-300 whitespace-pre-wrap">{m.message}</p>
              <p className="text-[10px] text-neutral-500">
                {new Date(m.createdAt).toLocaleString()} — {m.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
