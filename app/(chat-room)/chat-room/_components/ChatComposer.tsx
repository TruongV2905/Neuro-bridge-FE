"use client"

import { useRef, useState } from "react"
import { FilePlus2, ImagePlus, Send, Smile } from "lucide-react"

export function ChatComposer() {
  const [message, setMessage] = useState("")
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSend = () => {
    if (!message.trim()) return

    console.log("Send message:", message)
    setMessage("")
  }

  return (
    <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <div className="flex items-center gap-1 pr-1 border-r border-slate-100">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[var(--primary)]"
          >
            <Smile className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[var(--primary)]"
          >
            <ImagePlus className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[var(--primary)]"
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
            console.log("Selected image:", file)
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            console.log("Selected file:", file)
          }}
        />

        <div className="flex flex-1 items-center rounded-full bg-slate-50 px-4 ml-1 border border-slate-100/50 focus-within:border-[var(--primary)]/30 focus-within:bg-white focus-within:shadow-xs transition">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSend()
              }
            }}
            placeholder="Type your message here..."
            className="h-10 flex-1 bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white transition shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4 ml-0.5" />
        </button>
      </div>
    </div>
  )
}