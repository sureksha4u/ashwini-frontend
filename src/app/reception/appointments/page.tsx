"use client";

import { useRouter } from "next/navigation";
import { Calendar, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";

export default function AppointmentsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Reception", "Appointments"]} />
      <main className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md w-full text-center py-12 px-8">
          <div className="w-16 h-16 rounded-2xl bg-accent-soft mx-auto mb-5 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-accent" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Appointments calendar</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            Scheduled appointment booking with weekly/monthly calendar view is coming in the next release.
            Today&apos;s queue is managed from the OP Queue.
          </p>
          <div className="flex gap-3">
            <Btn variant="secondary" full icon={<ArrowLeft className="w-3.5 h-3.5" />} onClick={() => router.push("/reception/queue")}>
              View queue
            </Btn>
            <Btn full onClick={() => router.push("/reception/register")}>
              Register patient
            </Btn>
          </div>
        </Card>
      </main>
    </div>
  );
}
