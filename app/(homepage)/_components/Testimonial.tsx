import React from 'react'
import Image from 'next/image'

const Testimonial = () => {
  return (
    <div className="relative h-[770px] w-full overflow-hidden rounded-[10px] bg-[#161c2d] px-[15px]">
      {/* Content Left */}
      <div className="absolute left-[245px] top-[197px]">
        {/* Quote Icon */}
        <div className="mb-[30px]">
          <Image
            src="/img/quote-img.png"
            alt="Quote"
            width={43}
            height={100}
            style={{ height: 'auto', width: '100%' }}
          />
        </div>

        {/* Stars */}
        <div className="mb-[30px] flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Image
              key={i}
              src="/img/Star.png"
              alt="Star"
              width={40}
              height={40}
            />
          ))}
        </div>

        {/* Testimonial Text */}
        <p className="mb-[130px] w-[540px] text-2xl font-normal leading-[34px] text-white tracking-[-0.5px]">
          "OMG! I cannot believe that I have got a brand new room after getting your services. It was super easy to order and get started."
        </p>

      </div>

      {/* Image Section */}
      <div className="relative ml-auto mr-[15%] mt-[10%] h-[463px] w-[349px]">
        <div className="absolute right-0 top-0 h-[463px] w-[349px] rounded-[10px] bg-[#7d818d]" />
        {/* Placeholder for customer image - replace with actual image path */}
          <div className="absolute right-6 -top-6 h-[463px] w-[349px] overflow-hidden rounded-[10px]">
            <Image
              src="/img/CustomerImg.png"
              alt="Customer"
              width={349}
              height={463}
              className="h-full w-full object-cover"
            />
          </div>
      </div>

    </div>
  )
}

export default Testimonial
