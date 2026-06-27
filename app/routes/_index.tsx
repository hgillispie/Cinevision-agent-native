import {
  AgentChatSurface,
  markAgentChatHomeHandoff,
  useT,
} from "@agent-native/core/client";
import { IconSettings, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

function openWorkspaceSettings() {
  window.dispatchEvent(new CustomEvent("agent-panel:set-mode", { detail: { mode: "workspace" } }));
}

import { APP_TITLE } from "@/lib/app-config";
import { TAB_ID } from "@/lib/tab-id";

const SEO_TITLE = `${APP_TITLE} — Internal AI Tooling for CineVision Teams`;
const SEO_DESCRIPTION =
  "CineVision Studio: your internal AI workspace for building tools, managing content pipelines, and configuring data sources for vertical video operations.";

export function meta() {
  return [
    { title: SEO_TITLE },
    { name: "description", content: SEO_DESCRIPTION },
    { property: "og:title", content: SEO_TITLE },
    { property: "og:description", content: SEO_DESCRIPTION },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: SEO_TITLE },
    { name: "twitter:description", content: SEO_DESCRIPTION },
  ];
}

function chatThreadPath(threadId: string | null) {
  return threadId ? `/chat/${encodeURIComponent(threadId)}` : "/";
}

function StickyNote({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div
      style={{
        background: "hsl(40, 35%, 14%)",
        borderLeft: "3px solid hsl(40, 28%, 58%)",
      }}
      className="relative rounded-md px-4 py-3 text-sm"
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Dismiss"
      >
        <IconX className="size-3.5" />
      </button>
      {children}
    </div>
  );
}

function WorkspaceSettingsBar() {
  return (
    <div className="mx-auto mb-3 flex max-w-xl items-center justify-between gap-3 px-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: "hsl(40, 28%, 58%)" }}
        />
        CineVision Studio — Internal Tools
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openWorkspaceSettings()}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <IconSettings className="size-3.5" />
          Agent Settings
        </button>
        <Link
          to="/settings"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Workspace
        </Link>
      </div>
    </div>
  );
}

const PM_TIPS = [
  {
    id: "purpose",
    text: (
      <>
        <p className="font-medium" style={{ color: "hsl(40, 28%, 68%)" }}>
          Welcome to CineVision Studio
        </p>
        <p className="mt-1 text-muted-foreground">
          This is your internal AI workspace. Prompt the agent to add data
          sources, configure video upload pipelines, connect APIs, or build
          custom tools for your team.
        </p>
      </>
    ),
  },
  {
    id: "config",
    text: (
      <>
        <p className="font-medium" style={{ color: "hsl(40, 28%, 68%)" }}>
          Getting started
        </p>
        <p className="mt-1 text-muted-foreground">
          Try: <em>"Add a video upload action"</em>,{" "}
          <em>"Connect to our content database"</em>, or{" "}
          <em>"Create a dashboard for campaign metrics"</em>.
        </p>
      </>
    ),
  },
  {
    id: "builder",
    text: (
      <>
        <p className="font-medium" style={{ color: "hsl(40, 28%, 68%)" }}>
          Want to change the UI or layout?
        </p>
        <p className="mt-1 text-muted-foreground">
          The agent can wire up data and actions — but for visual design
          changes (components, pages, styling), open a branch in your{" "}
          <strong className="text-foreground">Builder project</strong> and
          edit the UX there. Code changes deploy back here automatically.
        </p>
      </>
    ),
  },
];

export default function ChatRoute() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const [dismissedNotes, setDismissedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cv-dismissed-notes");
      if (stored) setDismissedNotes(new Set(JSON.parse(stored)));
    } catch {
      // ignore
    }
  }, []);

  function dismissNote(id: string) {
    setDismissedNotes((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("cv-dismissed-notes", JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const visibleTips = PM_TIPS.filter((tip) => !dismissedNotes.has(tip.id));

  useEffect(() => {
    function handleChatRunning(event: Event) {
      const detail = (event as CustomEvent).detail;
      if (detail?.isRunning === true) markAgentChatHomeHandoff("chat");
    }

    window.addEventListener("agentNative.chatRunning", handleChatRunning);
    return () =>
      window.removeEventListener("agentNative.chatRunning", handleChatRunning);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <AgentChatSurface
        mode="page"
        chatViewTransition
        className="h-full"
        defaultMode="chat"
        storageKey="chat"
        threadUrlSync={{
          routeThreadId: threadId ?? null,
          getPath: chatThreadPath,
          navigate,
        }}
        browserTabId={TAB_ID}
        showHeader={false}
        showTabBar={false}
        dynamicSuggestions={false}
        suggestions={[
          "Add a video upload action to this app",
          "Connect a data source or database table",
          "Build a campaign metrics dashboard",
          "What internal tools can we build here?",
        ]}
        emptyStateText={t("chat.emptyState")}
        emptyStateDisplay="hidden"
        centerComposerWhenEmpty
        composerLayoutVariant="hero"
        composerPlaceholder="Ask the agent to build something..."
        composerSlot={
          <div className="mx-auto mb-5 w-full max-w-xl px-4">
            <div className="mb-4 text-center">
              <h1
                className="text-2xl font-semibold tracking-tight sm:text-3xl"
                style={{ color: "hsl(40, 28%, 62%)" }}
              >
                {APP_TITLE}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Internal AI workspace for your vertical video operations
              </p>
            </div>

            <WorkspaceSettingsBar />

            {visibleTips.length > 0 && (
              <div className="mb-4 space-y-2">
                {visibleTips.map((tip) => (
                  <StickyNote
                    key={tip.id}
                    onDismiss={() => dismissNote(tip.id)}
                  >
                    {tip.text}
                  </StickyNote>
                ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
