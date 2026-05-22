import Link from "next/link";
import { Button } from "@/components/ui/button";

function CtaSection() {
  return (
    <section className="relative flex h-screen w-full  items-center justify-center overflow-hidden text-center">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/video/cta-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[#0b1020]/65" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-white">
        <h1 className="text-balance text-4xl font-extrabold leading-tight md:text-6xl">
          Ready to have a decorated lifestyle?
        </h1>

        <Button asChild variant="cta" size="cta" className="mt-8 shadow-lg shadow-black/20">
          <Link href="/availableAI">Start Shopping</Link>
        </Button>
      </div>
    </section>
  );
}

export default CtaSection;
