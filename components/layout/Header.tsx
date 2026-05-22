// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// const NAV_LINKS = [
//   { label: "AI Models", path: "/ai-models" },
//   { label: "AI Experts", path: "/experts" },
//   { label: "Support", path: "/support" },
//   { label: "Contact", path: "/contact" },
// ];

// export default function Header() {
//   const pathname = usePathname();

//   return (
//     <header 
//       // Tuyệt chiêu xử lý Width ôm trọn và tự căn giữa mọi thiết bị
//       className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 
//                  bg-[#232943] text-white rounded-full px-6 py-3 shadow-lg 
//                  flex items-center justify-between border border-white/10 backdrop-blur-sm"
//     >
//       {/* LOGO */}
//       <Link href="/" className="flex items-center gap-2">
//           <img 
//             src="/img/LogoFull.png" 
//             alt="Neuro Bridge Logo" 
//             className="h-10 w-auto object-contain"
//             // Hiển thị chữ fallback nếu ảnh gặp sự cố load
//             onError={(e) => {
//               e.currentTarget.style.display = 'none';
//               e.currentTarget.parentElement!.innerHTML = '<span class="font-bold text-white text-lg">Neuro Bridge</span>';
//             }}
//           />
//         </Link>

//       {/* MENU NAVIGATION */}
//       <nav className="hidden md:flex items-center gap-8">
//         {NAV_LINKS.map((link) => {
//           const isActive = pathname === link.path;
//           return (
//             <Link
//               key={link.path}
//               href={link.path}
//               className={`relative py-1 text-sm font-medium transition-colors duration-300
//                 ${isActive ? "text-blue-400" : "text-gray-300 hover:text-white"}
                
//                 /* Hiệu ứng gạch chân chạy từ trái sang phải */
//                 after:content-[''] after:absolute after:bottom-0 after:left-0 
//                 after:h-[2px] after:bg-blue-400 after:transition-all after:duration-300
//                 ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}
//               `}
//             >
//               {link.label}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* AUTH BUTTONS */}
//       <div className="flex items-center gap-4">
//         <Link 
//           href="/login" 
//           className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
//         >
//           Login
//         </Link>
//         <Link 
//           href="/register" 
//           className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 
//                      text-white rounded-full transition-all shadow-md shadow-blue-600/20"
//         >
//           Register
//         </Link>
//       </div>
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
// Import Button từ Shadcn UI
import { Button } from "@/components/ui/button"; 

const NAV_LINKS = [
  { label: "AI Models", path: "/ai-models" },
  { label: "AI Experts", path: "/experts" },
  { label: "Support", path: "/support" },
  { label: "Contact", path: "/contact" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="  top-4 flex w-full  items-center justify-between rounded-full border border-border/80 bg-linear-to-r from-[#ffffff] via-[#b7f1ff] to-[#e5d1ff] px-6 py-3 text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/img/LogoFull.png"
          alt="Neuro Bridge Logo"
          width={200}
          height={50}
          className="h-10 w-auto object-contain"
          quality={100}
          priority
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = '<span class="font-bold text-white text-lg">Neuro Bridge</span>';
          }}
        />
      </Link>

      <nav className="hidden items-center gap-6 md:flex">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200
                ${isActive ? "bg-primary/12 text-primary" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* AUTH BUTTONS (Chuẩn cấu trúc Shadcn UI) */}
      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="ghost"
          className="rounded-full px-4 text-foreground/80 hover:bg-muted hover:text-foreground"
        >
          <Link href="/login">Login</Link>
        </Button>

        <Button
          asChild
          className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </header>
  );
}