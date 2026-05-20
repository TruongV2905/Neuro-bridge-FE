import React from 'react'
import HeroBanner from './HeroBanner'
import Content from './Content'
import Testimonial from './Testimonial'

const page = () => {
  return (
    <div>
      <HeroBanner/>
      <br />
      <Content/>
      <br />
      <Testimonial/>
    </div>
  )
}

export default page
