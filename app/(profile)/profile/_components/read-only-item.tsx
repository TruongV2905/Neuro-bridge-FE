interface ReadOnlyItemProps {
  icon: React.ReactNode
  label: string
  value: string
  active?: boolean
}

export function ReadOnlyItem({ icon, label, value, active }: ReadOnlyItemProps) {
  return (
    /* 1. Thẻ bọc ngoài cùng: p-[1px] để tạo độ dày viền. 
       - Nếu active (Status): Viền luôn là màu xanh lục mờ.
       - Nếu không active (User ID, Role): Khi HOVER sẽ lộ viền Gradient chạy xung quanh.
    */
    <div className={`group relative min-h-[102px] rounded-2xl p-[1px] transition-all duration-500 ${active
        ? "border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
        : "bg-border hover:shadow-[0_0_20px_rgba(95,123,255,0.12)]"
      }`}>

      {/* 2. Lớp nền Gradient: Chỉ hiển thị khi KHÔNG PHẢI là ô active (Status) và có HOVER chuột */}
      {!active && (
        <div
          style={{
            background: 'linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)'
          }}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-[1px]"
        />
      )}

      {/* 3. Phần ruột hiển thị nội dung bên trong */}
      <div className={`relative z-10 flex min-h-[100px] items-center gap-4 rounded-[15px] p-4 transition-all duration-500 ${active
          ? "bg-transparent" // Ô Status giữ nguyên nền mờ của thẻ cha
          : "bg-muted/60 group-hover:bg-card" // Ô thường sẽ đổi từ nền xám sang nền Card khi hover
        }`}>

        {/* Ô chứa Icon */}
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-300 ${active
            ? "bg-emerald-500 text-white border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            : "bg-muted text-muted-foreground border-border group-hover:bg-primary group-hover:text-primary-foreground"
          }`}>
          {icon}
        </div>

        {/* Nội dung chữ */}
        {/* Nội dung chữ */}
        <div className="flex flex-col justify-center">
          <p className={`text-xs font-semibold text-muted-foreground transition-colors duration-300 ${!active && "group-hover:text-primary"
            }`}>
            {label}
          </p>

          <p className={`text-sm font-bold transition-colors duration-300 ${active
              ? "text-emerald-500 tracking-wide"
              : "text-card-foreground"
            }`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}