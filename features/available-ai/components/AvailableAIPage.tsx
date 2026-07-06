"use client"

import { useState } from "react"

import { AvailableAICard } from "./AvailableAICard"
import { AvailableAICardDetail } from "./AvailableAICardDetail"
import { availableAIData } from "../mocks/availableAIData"
import type { AvailableAI } from "../types"

export function AvailableAIPage() {
  const [selectedAI, setSelectedAI] =
    useState<AvailableAI | null>(null)

  const [openDetail, setOpenDetail] = useState(false)

  return (
    <>
      <div className=" mx-auto grid w-full max-w-[1640px] grid-cols-1 gap-6 p-8 justify-items-center sm:grid-cols-2 xl:grid-cols-3"
    >
        {availableAIData.map((item) => (
          <AvailableAICard
            key={item.id}
            {...item}
            onViewDetails={() => {
              setSelectedAI(item)
              setOpenDetail(true)
            }}
          />
        ))}
      </div>

      {selectedAI && (
        <AvailableAICardDetail
          open={openDetail}
          onOpenChange={setOpenDetail}
          data={selectedAI}
        />
      )}
    </>
  )
}
