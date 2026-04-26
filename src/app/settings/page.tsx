"use client";

import { useEffect, useState } from "react";
import { Settings, User, Bell, Shield, Palette, Building2, ChevronRight, Check } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Btn } from "@/components/ui/Btn";
import { getMe } from "@/lib/api/users";
import type { UserResponse } from "@/lib/types";

const SECTIONS = [
  { icon: <User className="w-4 h-4" />, label: "Profile", sub: "Name, photo, contact" },
  { icon: <Bell className="w-4 h-4" />, label: "Notifications", sub: "Alerts, sounds, email" },
  { icon: <Palette className="w-4 h-4" />, label: "Appearance", sub: "Theme, density, font size" },
  { icon: <Shield className="w-4 h-4" />, label: "Security", sub: "Password, 2FA, sessions" },
  { icon: <Building2 className="w-4 h-4" />, label: "Hospital info", sub: "Address, contact, logo" },
];

export default function SettingsPage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMe().then(setUser).catch(() => null);
  }, []);

  const u = user as unknown as { first_name?: string; last_name?: string; role?: string; email?: string } | null;
  const displayName = u ? [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email || "User" : "—";
  const role = u?.role ?? "STAFF";

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Settings"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Settings</h1>
            <p className="text-xs text-text-secondary mt-1">Account and workspace preferences</p>
          </div>

          {/* Profile card */}
          <Card className="mb-6 flex items-center gap-4">
            <Avatar name={displayName} role={role.toLowerCase() as "doctor" | "nurse" | "admin" | "staff"} size={56} />
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold text-text-primary">{displayName}</div>
              <div className="text-xs text-text-secondary mt-0.5">{u?.email ?? "—"}</div>
              <div className="text-[11px] font-mono text-text-muted mt-0.5 uppercase">{role}</div>
            </div>
            <Btn variant="secondary" size="sm" onClick={handleSave}>
              {saved ? <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-success" /> Saved</span> : "Edit profile"}
            </Btn>
          </Card>

          {/* Settings sections */}
          <Card noPadding>
            {SECTIONS.map((s, i) => (
              <button
                key={s.label}
                className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-surface-2/60 transition-colors text-left ${i < SECTIONS.length - 1 ? "border-b border-border-subtle" : ""}`}
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary">{s.label}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{s.sub}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              </button>
            ))}
          </Card>

          <p className="text-xs text-text-muted text-center mt-8">
            Ashwini HMS · Full settings panel coming soon
          </p>
        </div>
      </main>
    </div>
  );
}
