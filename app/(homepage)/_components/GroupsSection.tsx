import Image from "next/image"
import Link from "next/link"
import type { HomepageGroup } from "@/types/homepage"
import { GradientLabel } from "./HomepagePrimitives"
import muiTen from "@/public/figma/homepage/duong-dan-anh-mui-ten.svg"


interface GroupsSectionProps {
  groups: readonly HomepageGroup[]
}

export default function GroupsSection({ groups }: Readonly<GroupsSectionProps>) {
  return (
    <section className="px-6 py-20 sm:py-24 lg:px-[7.5%]">
      <div className="mx-auto max-w-[1360px]">
        <div data-reveal>
          <GradientLabel>GROUPS</GradientLabel>
          <h2 className="mt-8 text-[clamp(2.25rem,3.2vw,3rem)] font-extrabold uppercase leading-none">
            Plan your adventures
          </h2>
        </div>
        <div className="mt-14 grid gap-7 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-10">
          {groups.map((group) => (
            <Link
              data-reveal
              key={group.title}
              href="/experts"
              className="group relative flex aspect-[2.9] min-h-[170px] items-end overflow-hidden px-7 pb-8 text-white sm:px-9"
            >
              <Image
                src={group.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
              <h3 className="relative z-10 max-w-[80%] text-xl font-extrabold sm:text-[28px]">{group.title}</h3>
              <span className="relative z-10 ml-auto bg-linear-to-r from-[#5470ff] to-[#fc38da] bg-clip-text text-4xl font-bold text-transparent">
                <Image
                  src={muiTen}
                  alt=""
                  aria-hidden="true"
                  width={36}
                  height={36}
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
