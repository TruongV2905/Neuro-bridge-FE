"use client"

import Header from "@/components/layout/Header"
import { ProjectSubmissionPanel } from "./_components/ProjectSubmissionPanel"
import { ChatComposer } from "./_components/ChatComposer"
import { ChatHeader } from "./_components/ChatHeader"
import { ChatMessage } from "./_components/ChatMessage"
import { ChatProfilePanel } from "./_components/ChatProfilePanel"
import {
  chatMedia,
  chatMessages,
  chatPartner,
  currentUser,
} from "./_data/mock-chat-room"
import { ClientProjectSubmissionPanel } from "./_components/ClientProjectSubmissionPanel"

export default function ChatRoomPage() {
  return (
    <div className="relative min-h-screen bg-[#eaf3ff]">
      {/* 1. Nền sáng tổng thể phía sau */}
      <div className="fixed inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-[#eef5ff] via-[#f7fbff] to-transparent" />

      {/* 2. Lớp phủ kính mờ thông minh giúp nổi chữ White (Chọn Option 1 hoặc 2 ở trên) */}
      <div className="fixed inset-x-0 top-0 z-10 h-24 bg-indigo-950/15 backdrop-blur-xl border-b border-white/20" />

      {/* 3. Đưa Header lên cao hẳn để nhận tương phản */}
      <div className="relative z-20">
        <Header />
      </div>

      <main className="relative z-10 px-4 pb-6 pt-24">
        <div className="mx-auto mt-4 flex h-[calc(100vh-128px)] max-w-[1600px] gap-4 min-h-0">

          {/* VÙNG 1: CỤM CHAT & PROFILE PANEL */}
          <section className="flex flex-1 max-w-[2000px] min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-white/95 backdrop-blur-sm shadow-md transition-all">
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <ChatHeader user={chatPartner} />

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                <div className="mx-auto flex flex-col gap-6 pb-4">
                  <div className="flex justify-center my-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      Yesterday
                    </span>
                  </div>

                  {chatMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      currentUser={currentUser}
                      partner={chatPartner}
                    />
                  ))}
                </div>
              </div>

              <ChatComposer />
            </div>

            <ChatProfilePanel user={chatPartner} media={chatMedia} />
          </section>

          {/* VÙNG 2: KHU VỰC NỘP PROJECT Ở GÓC PHẢI */}
          <ProjectSubmissionPanel />
          <ClientProjectSubmissionPanel />
        </div>
      </main>
    </div>
  )
}