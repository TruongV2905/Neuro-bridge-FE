"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSelector } from "react-redux"

import PageWrapper from "@/components/common/PageWrapper"
import type { RootState } from "@/redux/store"
import type { UserResponse } from "@/types/user"
import { getUserByCode } from "@/services/user-api"

const EXPERT_CODE = "EXP-OYPHF0XKD8"

export default function ExpertsPage() {
  const currentUser = useSelector(
    (state: RootState) => state.user
  ) as UserResponse | null

  const [expert, setExpert] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExpert() {
      try {
        const token =
          currentUser?.accessToken || localStorage.getItem("accessToken")

        const data = await getUserByCode(EXPERT_CODE, token)
        setExpert(data)
      } catch (error) {
        console.error("Fetch expert error:", error)
        setExpert(null)
      } finally {
        setLoading(false)
      }
    }

    fetchExpert()
  }, [currentUser?.accessToken])

  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageWrapper
          title="Thuê Chuyên Gia AI"
          description="Tìm kiếm và hợp tác với những chuyên gia hàng đầu trong lĩnh vực Trí tuệ nhân tạo."
        >
          {loading ? (
            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
              Đang tải danh sách expert...
            </div>
          ) : !expert ? (
            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-red-500">
              Không tải được expert.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex items-center gap-4">
                  <img
                    src={expert.avatarUrl || "/images/expert-avatar.png"}
                    alt={expert.fullName}
                    className="h-16 w-16 rounded-full border-2 border-indigo-50 object-cover"
                  />

                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {expert.fullName}
                    </h3>
                    <p className="text-sm font-medium text-indigo-600">
                      {expert.role === "EXPERT" ? "AI Expert" : expert.role}
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {expert.skillIds?.length ? (
                    expert.skillIds.map((skillId) => (
                      <span
                        key={skillId}
                        className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                      >
                        Skill #{skillId}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      Chưa có skill
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      ⭐ 5.0
                    </span>
                    <span className="text-xs text-gray-500">
                      Expert verified
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      Contact
                    </span>
                    <span className="block text-xs text-gray-500">
                      {expert.phone || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/experts/${expert.code}`}
                  className="mt-6 block w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-center font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Xem Hồ Sơ & Thuê
                </Link>
              </div>
            </div>
          )}
        </PageWrapper>
      </div>
    </main>
  )
}