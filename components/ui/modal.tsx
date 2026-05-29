// "use client";

// import { useEffect } from "react"

// type ModalProps = {
//   open: boolean
//   onClose: () => void
//   title?: string
//   children: React.ReactNode
// }

// export function Modal({ open, onClose, title, children }: ModalProps) {
//   useEffect(() => {
//     if (!open) return

//     const handleEsc = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         onClose()
//       }
//     }

//     window.addEventListener("keydown", handleEsc)

//     return () => {
//       window.removeEventListener("keydown", handleEsc)
//     }
//   }, [open, onClose])

//   if (!open) return null

//   return (
//     <div
//       className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-xl w-[600px] p-6 shadow-xl"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between mb-4">
//           <h2 className="text-lg font-semibold">{title}</h2>
//           <button onClick={onClose}>✕</button>
//         </div>

//         {children}
//       </div>
//     </div>
//   )
// }

"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}