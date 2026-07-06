export default function HomepageFooter() {
  return (
    <footer className="bg-[#080d1a] px-6 py-16 text-white sm:py-20 lg:px-[7.5%]">
      <div className="mx-auto grid max-w-[1360px] gap-12 md:grid-cols-[1.25fr_0.8fr_0.8fr]">
        <div>
          <p className="bg-linear-to-r from-[#8ea0ff] to-[#ff7be8] bg-clip-text text-4xl font-extrabold text-transparent">
            NEURO BRIDGE
          </p>
          <p className="mt-7 max-w-[420px] text-lg leading-relaxed text-white/80">
            AI marketplace for discovering experts, automation workflows, and production-ready
            solutions for modern teams.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">PLATFORM</h2>
          <p className="mt-6 max-w-[270px] text-lg leading-relaxed text-white/70">
            Explore AI models, compare expert profiles, and turn project ideas into scoped delivery.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">AI SERVICES</h2>
          <ul className="mt-6 space-y-2 text-lg text-white/70">
            <li>AI Automation</li>
            <li>Computer Vision</li>
            <li>AI Agents</li>
            <li>NLP Solutions</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-[1360px] border-t border-white/25 pt-7 text-sm text-white/70 sm:text-base">
        Copyright &copy; 2026 Neuro Bridge. All rights reserved.
      </div>
    </footer>
  )
}
