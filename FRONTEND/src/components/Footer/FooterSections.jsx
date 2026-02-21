import React, { useState } from 'react'

const FooterSections = ({ sections, links, onLinkClick }) => {
  const [openSections, setOpenSections] = useState({})

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const getLinksBySection = (sectionTitle) => {
    return links.filter(link => link.section === sectionTitle)
  }

  const handleLinkClick = (label) => {
    if (onLinkClick) {
      onLinkClick(label)
    }
  }

  const defaultCompanyLinks = [
    { label: 'About Us', url: '/about' },
    { label: 'Careers', url: '/careers' },
    { label: 'Blog', url: '/blog' },
    { label: 'Press', url: '/press' }
  ]

  const defaultSupportLinks = [
    { label: 'Help Center', url: '/help' },
    { label: 'Contact Us', url: '/contact' },
    { label: 'Track Order', url: '/track-order' },
    { label: 'Shipping Info', url: '/shipping' },
    { label: 'Returns', url: '/returns' },
    { label: 'FAQ', url: '/faq' }
  ]

  const defaultLegalLinks = [
    { label: 'Terms & Conditions', url: '/terms' },
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Cookie Policy', url: '/cookies' },
    { label: 'Refund Policy', url: '/refund' }
  ]

  const companySection = {
    _id: 'company',
    title: 'Company',
    links: defaultCompanyLinks,
    isActive: true
  }

  const supportSection = {
    _id: 'support',
    title: 'Support',
    links: defaultSupportLinks,
    isActive: true
  }

  const legalSection = {
    _id: 'legal',
    title: 'Legal',
    links: defaultLegalLinks,
    isActive: true
  }

  const activeSections = sections.filter(s => s.isActive)
  const hasCompany = activeSections.some(s => s.title.toLowerCase() === 'company')
  const hasSupport = activeSections.some(s => s.title.toLowerCase() === 'support')
  const hasLegal = activeSections.some(s => s.title.toLowerCase() === 'legal')
  
  let displaySections = hasCompany ? activeSections : [...activeSections, companySection]
  displaySections = hasSupport ? displaySections : [...displaySections, supportSection]
  displaySections = hasLegal ? displaySections : [...displaySections, legalSection]

  const SectionContent = ({ section }) => (
    <ul className='space-y-3'>
      {section.links?.length > 0 ? (
        section.links.map((link, index) => (
          <li key={index}>
            <a 
              href={link.url} 
              onClick={() => handleLinkClick(link.label)}
              className='text-[#a0a0a0] text-sm font-light hover:text-white transition-colors relative inline-block after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full'
            >
              {link.label}
            </a>
          </li>
        ))
      ) : (
        getLinksBySection(section.title).map((link) => (
          <li key={link._id}>
            <a 
              href={link.url} 
              onClick={() => handleLinkClick(link.label)}
              className='text-[#a0a0a0] text-sm font-light hover:text-white transition-colors relative inline-block after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full'
            >
              {link.label}
            </a>
          </li>
        ))
      )}
    </ul>
  )

  return (
    <>
      {displaySections.map((section) => (
        <div key={section._id} className='hidden md:block'>
          <h4 className='text-white font-bold text-sm uppercase tracking-wider mb-5'>{section.title}</h4>
          <SectionContent section={section} />
        </div>
      ))}

      <div className='md:hidden col-span-2'>
        {displaySections.map((section) => (
          <div key={section._id} className='border-b border-[#2a2a2a]'>
            <button 
              onClick={() => toggleSection(section._id)}
              className='w-full flex justify-between items-center py-4 text-white font-bold text-sm uppercase tracking-wider'
            >
              {section.title}
              <span className={`transition-transform duration-300 ${openSections[section._id] ? 'rotate-180' : ''}`}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${openSections[section._id] ? 'max-h-96 pb-4' : 'max-h-0'}`}>
              <SectionContent section={section} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default FooterSections
