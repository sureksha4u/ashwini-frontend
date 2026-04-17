"use client";

import { useState } from "react";
import { X, Link2, FileText, Mail, MessageCircle, Check, Loader2, ExternalLink } from "lucide-react";
import { generatePdf } from "@/lib/api/annotation";

interface SendPrescriptionModalProps {
  consultationId: string;
  patientPhone?: string;
  onClose: () => void;
}

type SendStatus = "idle" | "loading" | "done" | "error";

export function SendPrescriptionModal({ consultationId, patientPhone, onClose }: SendPrescriptionModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<SendStatus>("idle");
  const [linkCopied, setLinkCopied] = useState(false);

  const shareableLink = typeof window !== "undefined"
    ? `${window.location.origin}/consultation/${consultationId}/view`
    : `/consultation/${consultationId}/view`;

  async function ensurePdfUrl(): Promise<string | null> {
    if (pdfUrl) return pdfUrl;
    setPdfStatus("loading");
    try {
      const url = await generatePdf(consultationId);
      setPdfUrl(url);
      setPdfStatus("done");
      return url;
    } catch {
      setPdfStatus("error");
      return null;
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareableLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }

  async function handleDownloadPdf() {
    const url = await ensurePdfUrl();
    if (!url) return;
    window.open(url, "_blank");
  }

  async function handleEmail() {
    const url = await ensurePdfUrl();
    const body = url
      ? `Please find your prescription at: ${url}`
      : `Prescription link: ${shareableLink}`;
    window.open(
      `mailto:?subject=Your%20Prescription&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  }

  async function handleWhatsApp() {
    const url = await ensurePdfUrl();
    const message = url
      ? `Your prescription is ready. View/download here: ${url}`
      : `Your prescription is ready. View here: ${shareableLink}`;
    const phone = patientPhone?.replace(/\D/g, "") ?? "";
    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border-dark">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Send Prescription</h2>
            <p className="text-xs text-gray-400 mt-0.5">Choose how to share with the patient</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 grid grid-cols-2 gap-3">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 dark:border-border-dark hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              {linkCopied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {linkCopied ? "Copied!" : "Copy Link"}
            </span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={pdfStatus === "loading"}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 dark:border-border-dark hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-60"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              {pdfStatus === "loading" ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : pdfStatus === "done" ? (
                <ExternalLink className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {pdfStatus === "loading" ? "Generating…" : "Download PDF"}
            </span>
          </button>

          {/* Email */}
          <button
            onClick={handleEmail}
            disabled={pdfStatus === "loading"}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 dark:border-border-dark hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-60"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              {pdfStatus === "loading" ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Send via Email</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            disabled={pdfStatus === "loading"}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 dark:border-border-dark hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-60"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              {pdfStatus === "loading" ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">WhatsApp</span>
          </button>
        </div>

        {pdfStatus === "error" && (
          <p className="px-6 pb-4 text-xs text-red-500 text-center">
            PDF generation failed. Try copying the link instead.
          </p>
        )}

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-center">
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors underline underline-offset-2"
          >
            Done — close this window
          </button>
        </div>
      </div>
    </div>
  );
}
