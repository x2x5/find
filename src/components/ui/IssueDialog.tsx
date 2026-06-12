import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

interface IssueDialogProps {
  type: "feature" | "bug" | null;
  onClose: () => void;
}

export default function IssueDialog({ type, onClose }: IssueDialogProps) {
  const { t } = useAppContext();
  const placeholder =
    type === "feature"
      ? "描述你想要的功能..."
      : type === "bug"
        ? "描述你遇到的问题..."
        : "";
  const config =
    type === "feature"
      ? {
          bg: "bg-emerald-600",
          hover: "hover:bg-emerald-700",
          ring: "focus:ring-emerald-500",
        }
      : {
          bg: "bg-red-600",
          hover: "hover:bg-red-700",
          ring: "focus:ring-red-500",
        };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (type) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [type, onClose]);

  if (!type) return null;

  const handleSubmit = () => {
    const textArea = document.getElementById(
      "issue-description",
    ) as HTMLTextAreaElement;
    const description = textArea?.value || "";
    const labels = type === "feature" ? "enhancement" : "bug";
    const url = `https://github.com/x2x5/find/issues/new?labels=${labels}&title=${encodeURIComponent(type === "feature" ? "功能建议" : "Bug 报告")}&body=${encodeURIComponent(description)}`;
    window.open(url, "_blank");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 w-80 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <textarea
            id="issue-description"
            placeholder={placeholder}
            rows={5}
            className={`w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 ${config.ring} resize-none`}
            autoFocus
          />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {t.issueDialog.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg text-white ${config.bg} ${config.hover}`}
          >
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
