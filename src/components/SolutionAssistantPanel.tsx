import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import type { InnovationBrief, ChatMessage, ChatResponse } from "../types.ts";

interface SolutionAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  brief?: InnovationBrief | null;
  originalProblem?: string;
  contextMode?: "brief" | "dashboard";
  totalSavedBriefs?: number;
}

export const SolutionAssistantPanel: React.FC<SolutionAssistantPanelProps> = ({
  isOpen,
  onClose,
  brief,
  originalProblem,
  contextMode = "brief",
  totalSavedBriefs = 0,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Suggested starting prompts tailored to context
  const quickStarters = brief
    ? [
        {
          label: "Break down step 1",
          prompt: `Help me plan out the recommended first move ("${brief.first_move.action}") step-by-step for this week.`,
        },
        {
          label: "Draft outreach message",
          prompt: `Help me write a concise, professional message or proposal to reach out to one of the organizations or teams working on this.`,
        },
        {
          label: "Brainstorm 3 MVP concepts",
          prompt: `Given the gaps identified in this brief, what are 3 simple, low-cost MVP projects I could build or prototype in a weekend?`,
        },
        {
          label: "Explore a pathway",
          prompt: `Can we dive deeper into the pathway "${brief.pathways[0]?.platform || 'the top pathway'}"? What exact skills or tools will I need?`,
        },
      ]
    : [
        {
          label: "Prioritize my next move",
          prompt: `I have ${totalSavedBriefs} saved briefs on my dashboard. Help me decide which project to prioritize for maximum impact this week.`,
        },
        {
          label: "Turn an idea into a prototype",
          prompt: `How do I quickly build a prototype or start gathering real data for a social impact problem without funding?`,
        },
        {
          label: "Find open-source partners",
          prompt: `What are the most effective ways to find collaborators or open-source contributors for a civic-tech or citizen-science project?`,
        },
      ];

  // Initialize or reset chat when opening
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        let initialText = "";
        if (brief && originalProblem) {
          initialText = `I've reviewed your brief on **"${originalProblem}"**.\n\nWe have clear reframing around **${brief.problem_reframed.sub_problems[0] || "core challenges"}**, identified gaps in **${brief.gaps.openings[0] || "existing solutions"}**, and a clear first move to **${brief.first_move.action}**.\n\nWhere would you like to start? We can flesh out an MVP, map out your first 7 days, or draft outreach to key players.`;
        } else {
          initialText = `Welcome to your **Solution Assistant**.\n\nI'm ready to help you navigate your saved briefs, prioritize your next active commitment, or brainstorm rapid prototypes.\n\nWhat challenge or project would you like to tackle today?`;
        }

        setMessages([
          {
            id: "initial-assistant-msg",
            role: "model",
            content: initialText,
            timestamp: Date.now(),
          },
        ]);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, brief, originalProblem]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    // Update state with user message
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setError(null);
    setIsLoading(true);

    try {
      // Build history for backend (excluding the last new user message since it's passed as 'message')
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/assistant-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalProblem,
          brief,
          history: historyPayload,
          message: text,
          contextMode,
          totalSavedBriefs,
        }),
      });

      const data: ChatResponse = await res.json();

      if (!res.ok || data.error || !data.reply) {
        throw new Error(data.error || "Failed to receive a response from Gemini.");
      }

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      id="solution-assistant-panel"
      aria-label="Solution Assistant"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] md:w-[500px] bg-[var(--void)] border-l border-[var(--hair-strong)] shadow-2xl flex flex-col transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: "rgba(5, 7, 10, 0.96)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hair)] bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--foam)]/15 border border-[var(--foam)]/30 flex items-center justify-center text-[var(--foam)] shadow-xs relative">
            <Sparkles className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--foam)] border-2 border-[var(--void)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[var(--ink)] tracking-tight font-display">
                Solution Assistant
              </h2>
              <span className="eyebrow py-0 px-2 text-[9px] bg-[var(--sky)]/10 text-[var(--sky)] border border-[var(--sky)]/30">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-[var(--mute)] font-mono truncate max-w-[260px] sm:max-w-[300px]">
              {originalProblem || (contextMode === "dashboard" ? "Dashboard Exploration" : "Pathfinder Companion")}
            </p>
          </div>
        </div>

        <button
          id="btn-close-assistant"
          onClick={onClose}
          aria-label="Close assistant panel"
          className="p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 text-sm font-light">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 animate-message-in ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                  isUser
                    ? "bg-[var(--sky)]/20 text-[var(--sky)] border border-[var(--sky)]/40"
                    : "bg-[var(--foam)]/20 text-[var(--foam)] border border-[var(--foam)]/40"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message bubble with smooth animation */}
              <div
                className={`max-w-[84%] rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed transition-all shadow-xs ${
                  isUser
                    ? "bg-[var(--sky)]/15 border border-[var(--sky)]/30 text-white rounded-tr-xs"
                    : "bg-white/[0.04] border border-[var(--hair)] text-[var(--ink)] rounded-tl-xs whitespace-pre-wrap"
                }`}
              >
                <div className="space-y-2">
                  {msg.content.split("\n\n").map((para, i) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Animated Typing Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-message-in">
            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs bg-[var(--foam)]/20 text-[var(--foam)] border border-[var(--foam)]/40">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white/[0.04] border border-[var(--hair)] rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-3 text-xs text-[var(--mute)]">
              <div className="flex items-center gap-1.5 py-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--foam)] typing-dot-1" />
                <span className="w-2 h-2 rounded-full bg-[var(--foam)] typing-dot-2" />
                <span className="w-2 h-2 rounded-full bg-[var(--foam)] typing-dot-3" />
              </div>
              <span className="font-mono text-[11px] text-[var(--foam)]">Collaborating with Gemini...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              onClick={() => handleSendMessage()}
              className="underline text-rose-200 hover:text-white shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts (quick starters) when conversation is short */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 py-2.5 border-t border-[var(--hair)]/60 bg-white/[0.01]">
          <div className="text-[10px] font-mono text-[var(--faint)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3 text-[var(--foam)]" />
            <span>Suggested prompts</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickStarters.map((starter, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(starter.prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-[var(--hair)] hover:border-[var(--foam)]/50 hover:bg-[var(--foam)]/10 hover:text-[var(--foam)] text-[var(--mute)] transition text-left flex items-center gap-1 cursor-pointer"
              >
                <span>{starter.label}</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-[var(--hair)] bg-black/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-2 bg-white/[0.04] border border-[var(--hair-strong)] rounded-2xl p-2 focus-within:border-[var(--foam)]/60 transition"
        >
          <textarea
            ref={inputRef}
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about breaking down the problem, planning an MVP, outreach..."
            className="w-full bg-transparent text-xs sm:text-sm text-[var(--ink)] placeholder-[var(--faint)] resize-none focus:outline-none px-2 py-1 max-h-28"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="shrink-0 w-8 h-8 rounded-xl bg-[var(--foam)] text-[var(--void)] flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition font-medium shadow-xs cursor-pointer"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
        <div className="mt-1.5 px-1 flex items-center justify-between text-[10px] text-[var(--faint)] font-mono">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>Powered by Gemini</span>
        </div>
      </div>
    </aside>
  );
};

