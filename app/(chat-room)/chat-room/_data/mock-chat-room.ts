import type { ChatMessage, ChatUser } from "@/types/chat.types"

export const currentUser: ChatUser = {
  id: "client-1",
  name: "Thầy Giáo Ba",
  avatarUrl:
    "https://lh4.googleusercontent.com/N8zRhskPSotKzWxs5wm68JaDX0yCGY-ASI7g3AOqgBeFBD24sPQMd62CEsQT_WJRJ5RhFuBnEzzhcuTa-ZMussF_MQhbEYCKqKTCyL3zL6q17MYOpNpE3YqtUtyXIuBFkpyYlX-z",
  role: "client",
  status: "Online",
}

export const chatPartner: ChatUser = {
  id: "expert-1",
  name: "Zeros (Phạm Minh Lộc)",
  avatarUrl:
    "https://newsmd2fr.keeng.vn/tiin/archive/imageslead/2022/04/05/thumb4_e4cac013758f58a91e95739e002a2933.jpg",
  role: "expert",
  status: "Online",
}

export const chatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "expert-1",
    type: "text",
    content: "Alo anh Ba ơi, dự án thiết kế cái web landing page cho học viện SBTC tới đâu rồi anh? 🥸",
    time: "10:30 AM",
  },
  {
    id: "msg-2",
    senderId: "client-1",
    type: "text",
    content: "Đang coi lại đây Lộc ơi. Mà dạo này chú có rảnh không, qua phụ anh duyệt cái phần UI tí coi.",
    time: "10:32 AM",
  },
  {
    id: "msg-3",
    senderId: "expert-1",
    type: "text",
    content: "Em lúc nào chả rảnh anh, đang tính qua bên anh làm ly thốt nốt cốt dừa đây haha. Mà giao diện anh muốn làm theo style nào?",
    time: "10:35 AM",
  },
  {
    id: "msg-4",
    senderId: "client-1",
    type: "text",
    content: "Anh thích kiểu sạch sẽ, nhìn sang trọng tí chứ đừng có màu mè quá.",
    time: "10:38 AM",
  },
  {
    id: "msg-5",
    senderId: "client-1",
    type: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop",
    content: "Gửi chú cái sample layout chatroom với khu nộp đồ án anh mới dựng thử nè. Nhìn được không?",
    time: "10:39 AM",
  },
  {
    id: "msg-6",
    senderId: "expert-1",
    type: "text",
    content: "Ui layout này nhìn clean SaaS thế anh Ba! Con này phối màu primary xanh dương #5470ff nhìn chuẩn bài rồi.",
    time: "10:42 AM",
  },
  {
    id: "msg-7",
    senderId: "expert-1",
    type: "file",
    content: "À sẵn tiện em gửi luôn cái file requirement chi tiết mấy tính năng hôm bữa anh em mình chốt nha.",
    attachment: {
      id: "file-1",
      name: "sbtc-academy-requirements.pdf",
      url: "#",
      size: "3.2 MB",
      mimeType: "application/pdf",
    },
    time: "10:44 AM",
  },
  {
    id: "msg-8",
    senderId: "client-1",
    type: "text",
    content: "Ok để anh tải về check. Tí nữa tầm 2h qua thì alo anh trước, anh kêu xấp nhỏ chuẩn bị nước nôi nha.",
    time: "10:46 AM",
  },
  {
    id: "msg-9",
    senderId: "expert-1",
    type: "text",
    content: "Dạ vâng anh, chốt thế nha đại ca! Chút em qua liền. 💫",
    time: "10:47 AM",
  },
]

export const chatMedia = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop",
]