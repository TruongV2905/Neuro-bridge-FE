import { Input } from "@/components/ui/input"

interface FormFieldProps {
  label: string
  value: string
  icon: React.ReactNode
}

export function FormField({ label, value, icon }: FormFieldProps) {
  return (
    /* 1. Box ngoài cùng: Sử dụng relative và overflow-hidden để quản lý lớp viền */
    <div className="group relative rounded-2xl p-[1px] transition-all duration-500 bg-border hover:shadow-[0_0_20px_rgba(95,123,255,0.15)]">
      
      {/* 2. Lớp viền Gradient ẩn phía sau: Sẽ sáng lên và đổi màu khi hover vào GROUP */}
      <div 
        style={{
          background: 'linear-gradient(to right, #5f7bff 0%, #3e5ee0 35%, #8b5cf6 65%, #ec4899 100%)'
        }}
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-[1px]"
      />

      {/* 3. Phần nội dung thực tế (Field Box): Đè lên trên lớp gradient để tạo khoảng hở viền 1px */}
      <div className="relative z-10 rounded-[15px] bg-muted/40 p-4 transition-all duration-500 group-hover:bg-card">
        <label className="mb-2 block text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors duration-300">
          {label}
        </label>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-hover:text-primary transition-colors duration-300">
            {icon}
          </div>

          <Input
            defaultValue={value}
            className="h-11 rounded-xl border border-input/50 bg-card pl-10 text-sm font-medium text-card-foreground transition-all duration-300 focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary"
          />
        </div>
      </div>
    </div>
  )
}