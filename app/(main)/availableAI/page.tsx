"use client"

import { useState } from "react"
import { AvailableAICard } from "@/components/cards/AvailableAICard"
import { AvailableAICardDetail } from "@/components/cards/AvailableAICardDetail"
import { availableAIData } from "@/mocks/availableAIData"
import { AvailableAI } from "@/types/available-ai"

export default function AvailableAIPage() {
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
            name={item.name}
            status={item.status}
            type={item.type}
            successScore={item.successScore}
            description={item.description}
            techStacks={item.techStacks}
            author={item.author}
            budget={item.budget}
            hasGlow={item.hasGlow}
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
