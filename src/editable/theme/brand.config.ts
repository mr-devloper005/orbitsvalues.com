import { siteIdentity } from '@/config/site.identity'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'

const { recipe } = getFactoryState()
const productKind = getProductKind(recipe)

export const slot4BrandConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || siteIdentity.name,
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || siteIdentity.tagline,
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || siteIdentity.domain,
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || siteIdentity.url,
  productKind,
  ogImage: process.env.NEXT_PUBLIC_SITE_OG_IMAGE || siteIdentity.ogImage,
  accents:
    productKind === 'visual'
      ? { primary: '#8df0c8', surface: '#07101f' }
      : productKind === 'editorial'
        ? { primary: '#241711', surface: '#fbf6ee' }
        : productKind === 'directory'
          ? { primary: '#0f172a', surface: '#f8fbff' }
          : { primary: '#5b2b3b', surface: '#f7f1ea' },
} as const
