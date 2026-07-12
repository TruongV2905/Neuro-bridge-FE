"use client"

import { useRef, useState } from "react"
import {
  FilePlus2,
  ImagePlus,
  LoaderCircle,
  Send,
  Smile,
} from "lucide-react"

type PrivateChatComposerProps = {
  onSendMessage: (
    content: string,
  ) => Promise<boolean>
  disabled?: boolean
  isSending?: boolean
}

export function PrivateChatComposer({
  onSendMessage,
  disabled = false,
  isSending = false,
}: PrivateChatComposerProps) {
  const [message, setMessage] = useState("")

  const imageInputRef =
    useRef<HTMLInputElement | null>(null)

  const fileInputRef =
    useRef<HTMLInputElement | null>(null)

  async function handleSend() {
    const normalizedMessage = message.trim()

    if (
      !normalizedMessage ||
      disabled ||
      isSending
    ) {
      return
    }

    const sentSuccessfully =
      await onSendMessage(normalizedMessage)

    if (sentSuccessfully) {
      setMessage("")
    }
  }

  return (
    <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-4xl items-center gap-2">
        <div className="flex items-center gap-1 border-r border-slate-100 pr-1">
          <button
            type="button"
            disabled={disabled}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Smile className="h-5 w-5" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              imageInputRef.current?.click()
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ImagePlus className="h-5 w-5" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FilePlus2 className="h-5 w-5" />
          </button>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
        />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
        />

        <div className="ml-1 flex flex-1 items-center rounded-full border border-slate-100/50 bg-slate-50 px-4 transition focus-within:border-[var(--primary)]/30 focus-within:bg-white focus-within:shadow-xs">
          <input
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault()
                void handleSend()
              }
            }}
            disabled={disabled || isSending}
            placeholder={
              disabled
                ? "This conversation is unavailable"
                : "Type your message here..."
            }
            className="h-10 flex-1 bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={
            disabled ||
            isSending ||
            !message.trim()
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="ml-0.5 h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}