import { useEffect } from 'react'

export const useStructuredData = (schema) => {
  useEffect(() => {
    if (!schema) return

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    script.id = `schema-${Math.random().toString(36).substr(2, 9)}`
    
    document.head.appendChild(script)

    return () => {
      const existingScript = document.getElementById(script.id)
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [schema])
}

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LockerRoom",
    "url": "https://lockerroom.com",
    "logo": "https://lockerroom.com/logo.png",
    "description": "Your No.1 AUTHENTIC, REPLICA & CUSTOMIZE Online Sportswear store",
    "sameAs": [
      "https://facebook.com/lockerroom",
      "https://twitter.com/lockerroom",
      "https://instagram.com/lockerroom",
      "https://tiktok.com/@lockerroom",
      "https://youtube.com/lockerroom"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+233-000-000-000",
      "contactType": "customer service",
      "availableLanguage": ["English", "French", "Spanish", "German", "Portuguese", "Swahili", "Hausa", "Yoruba", "Igbo", "Twi", "Arabic", "Zulu"]
    }
  }

  useStructuredData(schema)
  return null
}

export const WebsiteSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "LockerRoom",
    "url": "https://lockerroom.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://lockerroom.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  useStructuredData(schema)
  return null
}

export const StoreSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "LockerRoom",
    "image": "https://lockerroom.com/logo.png",
    "priceRange": "$$",
    "currenciesAccepted": ["GHS", "NGN", "KES", "ZAR", "EGP", "MAD", "TZS", "UGX", "XOF", "XAF", "ETB", "RWF", "GBP", "USD", "CAD", "AUD"],
    "paymentAccepted": ["Credit Card", "Debit Card", "Mobile Money", "PayPal", "Apple Pay"],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GH",
      "addressRegion": "Greater Accra",
      "addressLocality": "Accra"
    }
  }

  useStructuredData(schema)
  return null
}

export const FAQSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is LockerRoom?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "LockerRoom is your No.1 AUTHENTIC, REPLICA & CUSTOMIZE Online Sportswear store."
        }
      },
      {
        "@type": "Question",
        "name": "How can I track my order?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can track your order using the Track Order feature on our website. You'll receive a tracking number via email once your order ships."
        }
      },
      {
        "@type": "Question",
        "name": "What is your return policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer a 30-day return policy for unused items in original packaging. Contact our support team to initiate a return."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods do you accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We accept Credit Cards, Debit Cards, Mobile Money (MTN, Telecel, AirtelTigo), PayPal, and Apple Pay."
        }
      },
      {
        "@type": "Question",
        "name": "Do you ship internationally?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We ship to multiple countries across Africa, Europe, North America, and Australia."
        }
      }
    ]
  }

  useStructuredData(schema)
  return null
}

export const StructuredData = () => {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      <StoreSchema />
      <FAQSchema />
    </>
  )
}

export const ProductSchema = ({ product }) => {
  if (!product) return null

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.productName,
    "image": product.productImage?.[0] || "https://lockerroom.com/images/product-placeholder.jpg",
    "description": product.description || product.productName,
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": product.brandName || "LockerRoom"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://lockerroom.com/product/${product._id}`,
      "priceCurrency": "GHS",
      "price": product.sellingPrice,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "LockerRoom"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || "4.5",
      "reviewCount": product.reviewCount || "100"
    }
  }

  useStructuredData(schema)
  return null
}

export const BreadcrumbSchema = ({ items }) => {
  if (!items || items.length === 0) return null

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  useStructuredData(schema)
  return null
}

export default StructuredData
