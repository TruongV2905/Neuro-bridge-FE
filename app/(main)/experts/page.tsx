"use client"

import Link from "next/link"

import PageWrapper from "@/components/common/PageWrapper"
import { useFilterUsers } from "@/services/user.service"
import { UserRole, UserStatus } from "@/types/user/user.type"

export default function ExpertsPage() {
  const {
    data: expertsResponse,
    isLoading: loading,
    error,
  } = useFilterUsers({
    page: 0,
    size: 10,
    sortBy: "createdAt",
    direction: "DESCENDING",
    search: "",
    filter: {
      role: UserRole.EXPERT,
      status: UserStatus.ACTIVE,
    },
  })

  const experts = expertsResponse?.result?.data ?? []

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
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-red-500">
              Không tải được danh sách expert.
            </div>
          ) : experts.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
              Chưa có expert nào.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => (
                <div
                  key={expert.code}
                  className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
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
                        AI Expert
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
              ))}
            </div>
          )}
        </PageWrapper>
      </div>
    </main>
  )
}