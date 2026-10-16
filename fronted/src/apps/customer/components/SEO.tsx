import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  author?: string
  noIndex?: boolean
}

export function SEO({
  title,
  description,
  keywords = 'food delivery, restaurants, online ordering, SanFoody',
  image = 'https://sanfoody.com/og-image.jpg',
  url = 'https://sanfoody.com',
  type = 'website',
  publishedTime,
  author = 'SanFoody',
  noIndex = false,
}: SEOProps) {
  const siteTitle = 'SanFoody - Premium Food Delivery'
  const fullTitle = title === siteTitle ? siteTitle : `${title} | ${siteTitle}`

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="SanFoody" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
    </Helmet>
  )
}