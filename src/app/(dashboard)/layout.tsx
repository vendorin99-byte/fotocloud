import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Check if user is in trial period
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, trialEndsAt: true },
  });

  const isTrialing = user?.trialEndsAt && new Date(user.trialEndsAt) > new Date();
  if (isTrialing) {
    redirect("/pricing");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Chat widget */}
      <ChatWidget />
    </div>
  );
}
