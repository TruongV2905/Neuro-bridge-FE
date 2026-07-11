import { FileText } from "lucide-react"

import type {
  ChatMessage as ChatMessageType,
  ChatUser,
} from "@/types/chat.types"

type ChatMessageProps = {
  message: ChatMessageType
  currentUser: ChatUser
  partner: ChatUser
}

export function ChatMessage({
  message,
  currentUser,
  partner,
}: ChatMessageProps) {
  const isMine = message.senderId === currentUser.id
  const sender = isMine ? currentUser : partner

  return (
    <div
      className={`flex items-end gap-3 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      {!isMine && (
        <img
          src={sender.avatarUrl}
          alt={sender.name}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
        />
      )}

      <div
        className={`flex max-w-[460px] flex-col ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`mb-1 flex items-center gap-1.5 text-[11px] text-slate-400 px-1 ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >
          {!isMine && (
            <span className="font-medium text-slate-600">{sender.name}</span>
          )}
          <span>{message.time}</span>
        </div>

        {message.type === "text" && (
          <TextBubble content={message.content ?? ""} isMine={isMine} />
        )}

        {message.type === "image" && (
          <ImageBubble
            imageUrl={message.imageUrl ?? ""}
            content={message.content}
            isMine={isMine}
          />
        )}

        {message.type === "file" && message.attachment && (
          <FileBubble
            fileName={message.attachment.name}
            fileSize={message.attachment.size}
            content={message.content}
            isMine={isMine}
          />
        )}
      </div>

      {isMine && (
        <img
          src={sender.avatarUrl}
          alt={sender.name}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-50"
        />
      )}
    </div>
  )
}

type BubbleProps = {
  isMine: boolean
}

function TextBubble({
  content,
  isMine,
}: BubbleProps & {
  content: string
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
        isMine
          ? "rounded-br-sm bg-[var(--primary)] text-white shadow-sm"
          : "rounded-bl-sm bg-slate-50 border border-slate-100 text-slate-800 shadow-sm"
      }`}
    >
      {content}
    </div>
  )
}

function ImageBubble({
  imageUrl,
  content,
  isMine,
}: BubbleProps & {
  imageUrl: string
  content?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl shadow-sm border ${
        isMine 
          ? "rounded-br-sm bg-[var(--primary)] border-transparent" 
          : "rounded-bl-sm bg-slate-50 border-slate-100"
      }`}
    >
      <img
        src={imageUrl}
        alt={content ?? "Chat image"}
        className="max-h-64 w-full max-w-sm object-cover transition hover:opacity-95 cursor-pointer"
      />

      {content && (
        <p
          className={`px-4 py-2.5 text-[14px] leading-relaxed ${
            isMine ? "text-white" : "text-slate-800"
          }`}
        >
          {content}
        </p>
      )}
    </div>
  )
}

function FileBubble({
  fileName,
  fileSize,
  content,
  isMine,
}: BubbleProps & {
  fileName: string
  fileSize?: string
  content?: string
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 shadow-sm border ${
        isMine
          ? "rounded-br-sm bg-[var(--primary)] text-white border-transparent"
          : "rounded-bl-sm bg-slate-50 text-slate-800 border-slate-100"
      }`}
    >
      {content && <p className="mb-2.5 text-[14px]">{content}</p>}

      <div
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
          isMine ? "bg-white/10 backdrop-blur-xs" : "bg-white border border-slate-100"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isMine ? "bg-white/20" : "bg-[var(--primary)]/10"
          }`}
        >
          <FileText
            className={`h-4 w-4 ${
              isMine ? "text-white" : "text-[var(--primary)]"
            }`}
          />
        </div>

        <div className="min-w-0 pr-2">
          <p className="truncate text-xs font-semibold">{fileName}</p>
          {fileSize && (
            <p
              className={`text-[11px] mt-0.5 ${
                isMine ? "text-white/70" : "text-slate-400"
              }`}
            >
              {fileSize}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}