"use client"

import { useRef, useState } from "react"
import { FilePlus2, ImagePlus, Loader2, Send, Smile } from "lucide-react"

type ChatComposerProps = {
  onSendMessage?: (content: string) => Promise<void> | void
  isSending?: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatComposer({
  onSendMessage,
  isSending = false,
  disabled = false,
  placeholder = "Type your message here...",
}: ChatComposerProps) {
  const [message, setMessage] = useState("")
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSend = async () => {
    const trimmed = message.trim()
    if (!trimmed || isSending || disabled) return

    setMessage("")
    if (onSendMessage) {
      await onSendMessage(trimmed)
    }
  }

  return (
    <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <div className="flex items-center gap-1 pr-1 border-r border-slate-100">
          <button
            type="button"
            onClick={() => setMessage((prev) => `${prev} 😊`.trimStart())}
            disabled={disabled || isSending}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[var(--primary)] disabled:opacity-40"
          >
            <Smile className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || isSending}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[var(--primary)] disabled:opacity-40"
          >
            <ImagePlus className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSending}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[var(--primary)] disabled:opacity-40"
          >
            <FilePlus2 className="h-5 w-5" />
          </button>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            setMessage((prev) =>
              prev ? `${prev} [Image: ${file.name}]` : `[Image: ${file.name}]`,
            )
            event.target.value = ""
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            setMessage((prev) =>
              prev ? `${prev} [File: ${file.name}]` : `[File: ${file.name}]`,
            )
            event.target.value = ""
          }}
        />

        <div className="flex flex-1 items-center rounded-full bg-slate-50 px-4 ml-1 border border-slate-100/50 focus-within:border-[var(--primary)]/30 focus-within:bg-white focus-within:shadow-xs transition">
          <input
            value={message}
            disabled={disabled}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void handleSend()
              }
            }}
            placeholder={placeholder}
            className="h-10 flex-1 bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!message.trim() || isSending || disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white transition shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  )
}
