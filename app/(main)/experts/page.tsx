import React from "react";
import Link from "next/link";
import PageWrapper from "@/components/common/PageWrapper"; // Tận dụng luôn PageWrapper vừa tạo!

// Dữ liệu mẫu (Mock data) - Sau này bạn sẽ call API để lấy dữ liệu thật
const MOCK_EXPERTS = [
  {
    id: "exp-001",
    name: "Dr. Alan Turing",
    role: "AI Research Scientist",
    hourlyRate: 150,
    rating: 4.9,
    reviews: 124,
    skills: ["Machine Learning", "Neural Networks", "Python"],
    avatar: "https://i.pravatar.cc/150?u=alan",
  },
  {
    id: "exp-002",
    name: "Ada Lovelace",
    role: "Data Engineer",
    hourlyRate: 120,
    rating: 4.8,
    reviews: 89,
    skills: ["Big Data", "SQL", "Cloud Architecture"],
    avatar: "https://i.pravatar.cc/150?u=ada",
  },
  {
    id: "exp-003",
    name: "John von Neumann",
    role: "NLP Specialist",
    hourlyRate: 180,
    rating: 5.0,
    reviews: 210,
    skills: ["NLP", "LLMs", "Prompt Engineering"],
    avatar: "https://i.pravatar.cc/150?u=john",
  },
];

export default function ExpertsPage() {
  return (
    // pt-24 giúp đẩy nội dung xuống dưới thanh Header (tùy chỉnh số này cho khớp chiều cao Header của bạn)
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Tận dụng PageWrapper để đồng bộ tiêu đề */}
        <PageWrapper 
          title="Thuê Chuyên Gia AI" 
          description="Tìm kiếm và hợp tác với những chuyên gia hàng đầu trong lĩnh vực Trí tuệ nhân tạo."
        >
          
          {/* Lưới hiển thị Card */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {MOCK_EXPERTS.map((expert) => (
              <div 
                key={expert.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md flex flex-col"
              >
                {/* Avatar & Info */}
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={expert.avatar} 
                    alt={expert.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-50"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{expert.name}</h3>
                    <p className="text-sm text-indigo-600 font-medium">{expert.role}</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {expert.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Rating & Price */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">⭐ {expert.rating}</span>
                    <span className="text-xs text-gray-500">({expert.reviews} đánh giá)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">${expert.hourlyRate}</span>
                    <span className="text-xs text-gray-500">/giờ</span>
                  </div>
                </div>

                {/* Nút Hire Me trỏ về trang chi tiết [id] */}
                <Link 
                  href={`/experts/${expert.id}`}
                  className="mt-6 w-full text-center block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                >
                  Xem Hồ Sơ & Thuê
                </Link>
              </div>
            ))}
          </div>

        </PageWrapper>
      </div>
    </main>
  );
}