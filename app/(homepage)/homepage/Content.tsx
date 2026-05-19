import React from 'react'

const Content = () => {
  return (
      <div className="relative h-[770px] w-[1570px] overflow-hidden rounded-[10px] bg-indigo-600">
          {/* Khối ảnh bên trái */}
          <div className="absolute left-[230px] top-[140px] h-[482px] w-96 rounded-lg bg-gray-500 shadow-[0_42px_44px_-10px_rgba(1,23,48,0.12)]" />
          
          {/* Card nổi */}
          <div className="absolute left-[500px] top-[330px] h-52 w-52 rounded-[10px] bg-white shadow-[0_42px_44px_-10px_rgba(1,23,48,0.12)]" />
          

          {/* Nội dung bên phải */}
          <div className="absolute left-[850px] top-[249px] h-72 w-96">
              <h2 className="w-full text-4xl font-bold leading-[48px] text-white">
                  Track your progress with our advanced site.
              </h2>

              <p className="mt-6 text-lg leading-8 text-white/60">
                  We share common trends and strategies for improving your rental income and
                  making sure you stay in high demand.
              </p>

              <a
                  href="#"
                  className="mt-10 inline-flex items-center gap-3 text-base font-bold leading-8 text-white"
              >
                  Start shopping
                  
              </a>
          </div>
      </div>
  )
}

export default Content
