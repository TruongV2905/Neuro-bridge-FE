import React from 'react'
import HeroBanner from './HeroBanner'
import Content from './Content'
import Testimonial from './Testimonial'
import CtaSection from './CtaSection'
import AppWrap from '@/components/common/AppWrap'
import NavDots from '@/components/common/NavDots'

const page = () => {
  const sections = [
    { id: 'hero', label: 'Hero' },
    { id: 'testimonial', label: 'Testimonial' },
    { id: 'content', label: 'Content' },
    { id: 'cta', label: 'CTA' },
  ]

  return (
    <div>
      <NavDots items={sections} />

      <AppWrap id="hero">
        <HeroBanner />
      </AppWrap>

      <br />

      <AppWrap id="testimonial">
        <Testimonial />
      </AppWrap>

      <br />

      <AppWrap id="content">
        <Content />
      </AppWrap>

      <br />

      

      <AppWrap id="cta">
        <CtaSection />
      </AppWrap>
    </div>
  )
}

export default page
