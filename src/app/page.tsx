import { Header } from "@/components/layout/Header";
import { PatientQueue } from "@/components/dashboard/PatientQueue";
import { getGreeting } from "@/lib/utils";

export default function DashboardPage() {
  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {greeting}, Dr. Mehta
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{today}</p>
        </div>

        {/* Patient Queue */}
        <PatientQueue />
      </main>
    </div>
  );
}
