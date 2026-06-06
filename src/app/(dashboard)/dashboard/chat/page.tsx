import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminChatPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch all chat messages (admin view)
  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  // Group by user
  const groupedByUser = messages.reduce(
    (acc, msg) => {
      const userId = msg.userId;
      if (!acc[userId]) {
        acc[userId] = { user: msg.user, messages: [] };
      }
      acc[userId].messages.push(msg);
      return acc;
    },
    {} as Record<string, any>
  );

  const conversations = Object.values(groupedByUser);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chat Support</h1>
        <p className="text-gray-600 mt-1">Manage user conversations</p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No conversations yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {conversations.map((conv: any) => (
            <div
              key={conv.user.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {conv.user.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-600">{conv.user.email}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {conv.messages.length} messages
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conv.messages
                  .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`text-sm p-3 rounded border-l-4 ${
                        msg.isFromAdmin
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-blue-50 border-blue-300 text-gray-900"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-semibold mb-1">
                          {msg.isFromAdmin ? "👨‍💼 Admin" : "👤 " + (conv.user.name || "User")}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
