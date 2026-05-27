export default function HomepageFooter() {
  return (
    <footer className="bg-linear-to-r from-[#5470ff] to-[#fc38da] px-6 py-16 text-white sm:py-20 lg:px-[7.5%]">
      <div className="mx-auto grid max-w-[1360px] gap-12 md:grid-cols-[1.25fr_0.8fr_0.8fr]">
        <div>
          <p className="text-4xl font-extrabold">ADVENTIS</p>
          <p className="mt-7 max-w-[420px] text-lg leading-relaxed text-white/80">
            Adventure sports booking homepage redesigned from the provided 123Website demo reference.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-black">OUR LOCATION</h2>
          <p className="mt-6 max-w-[270px] text-lg leading-relaxed">
            2972 Westheimer Rd. Santa Ana, Illinois 85486
          </p>
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-black">ACTIVITIES</h2>
          <ul className="mt-6 space-y-2 text-lg">
            <li>Kayaking</li>
            <li>River Rafting</li>
            <li>Archery</li>
            <li>Paintball</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-[1360px] border-t border-white/25 pt-7 text-sm text-white/70 sm:text-base">
        Copyright &copy; 2026 Adventis style mockup. All rights reserved.
      </div>
    </footer>
  )
}
