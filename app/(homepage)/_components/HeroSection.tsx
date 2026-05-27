import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="homepage-hero relative flex min-h-svh items-center justify-center overflow-hidden bg-[#0a0d17] px-6 text-center text-white sm:min-h-[910px]">
      <Image
        src="/figma/homepage/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-media object-cover opacity-60"
      />
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/video/homepage-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#0a0d17]/35" />
      <div className="relative z-10 mx-auto w-full max-w-[980px]">
        <h1 className="overflow-hidden text-[clamp(2.75rem,8vw,7.25rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.045em]">
          <span className="hero-title-line block">Incredible</span>
          <span className="hero-title-line block">Adventure</span>
        </h1>
        <p className="hero-copy mx-auto mt-12 max-w-[760px] text-base font-bold sm:text-[22px]">
          We minimize your waste in every step of the process.
        </p>
        <p className="hero-copy mt-5 text-sm font-medium text-white/90 sm:text-lg">
          Outdoor activity booking theme reference
        </p>
      </div>
    </section>
  )
}
