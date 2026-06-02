import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Fresh articles, smart reads, and useful ideas',
      description: 'Read timely articles, editor picks, and useful explainers through a polished magazine-style article platform.',
      openGraphTitle: 'Fresh articles, smart reads, and useful ideas',
      openGraphDescription: 'Discover article-led stories, essays, explainers, and curated reads in a cleaner editorial experience.',
      keywords: ['article platform', 'online magazine', 'editorial articles', 'content discovery'],
    },
    hero: {
      badge: 'Premium article journal',
      title: ['Read with depth,', 'return with perspective.'],
      description: 'A polished home for timely articles, long-form thinking, practical explainers, and carefully selected editorial picks.',
      primaryCta: { label: 'Read latest stories', href: '/article' },
      secondaryCta: { label: 'Explore visuals', href: '/image' },
      searchPlaceholder: 'Search articles, topics, authors, and ideas',
      focusLabel: 'Focus',
      featureCardBadge: 'latest cover rotation',
      featureCardTitle: 'The latest articles lead the edition.',
      featureCardDescription: 'New essays, analysis, and guides are presented with a refined magazine rhythm.',
    },
    intro: {
      badge: 'About the platform',
      title: 'Built for article discovery, clean reading, and lasting context.',
      paragraphs: [
        'This site is shaped around articles first: strong headlines, useful summaries, generous imagery, and focused reading paths.',
        'Instead of stretching every page across the screen, the interface keeps content at a comfortable editorial width with sections that feel intentional.',
        'Readers can move from a headline to related ideas, search the archive, and return to fresh picks without losing their place.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Article-first homepage with feature, rail, and index-style reading patterns.',
        'Comfortable page widths that avoid stretched copy and oversized grids.',
        'Cleaner cards for scanning headlines, excerpts, and categories.',
        'Lightweight navigation that keeps the archive, search, and account actions close.',
      ],
      primaryLink: { label: 'Browse articles', href: '/article' },
      secondaryLink: { label: 'See visuals', href: '/image' },
    },
    cta: {
      badge: 'Start exploring',
      title: 'Explore the latest articles through one polished reading system.',
      description: 'Move between essays, explainers, guides, and editorial picks through a clearer magazine-style experience.',
      primaryCta: { label: 'Browse Articles', href: '/article' },
      secondaryCta: { label: 'Contact Sales', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'Our Story',
    title: 'A calmer, clearer way to explore articles.',
    description: `${slot4BrandConfig.siteName} is an article-first publication experience for readers who want useful ideas, strong context, and clean navigation.`,
    paragraphs: [
      'We design every page around the act of reading: a strong opening, useful summaries, comfortable line lengths, and cards that help people decide what to open next.',
      'The platform is built for articles, essays, guides, and opinion-led publishing. Readers can discover new topics from the homepage, search the archive, and keep moving through related ideas without feeling lost.',
      'For contributors and editors, the experience keeps publishing simple while giving each article enough visual polish to feel considered and trustworthy.',
    ],
    values: [
      {
        title: 'Reading-first experience',
        description: 'We prioritize clarity, pacing, and structure so people can read, browse, and discover without noise.',
      },
      {
        title: 'Connected content surfaces',
        description: 'Articles, guides, opinion pieces, and resource-style posts stay connected so discovery feels natural across the site.',
      },
      {
        title: 'Simple and trustworthy',
        description: 'We focus on clean navigation and clear page structure to help visitors find useful content faster.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Talk to the editorial desk.',
    description: 'Send article pitches, partnership questions, correction notes, or publishing support requests. We will route your message to the right editorial lane.',
    formTitle: 'Send an editorial note',
  },

  search: {
    metadata: {
      title: 'Search',
      description: 'Search articles, topics, categories, and content across the site.',
    },
    hero: {
      badge: 'Search the archive',
      title: 'Find articles, topics, and useful ideas faster.',
      description: 'Use keywords, categories, and content types to discover articles from every active section of the site.',
      placeholder: 'Search by keyword, topic, author, or title',
    },
    resultsTitle: 'Latest searchable content',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Create and submit new content for the site.',
    },
    locked: {
      badge: 'Creator access',
      title: 'Login to create new content.',
      description: 'Use your account to open the publishing workspace and create posts for the active sections of this site.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Create content for every active section.',
      description: 'Choose the content type, add details, and prepare a clean post with images, links, summary, and body content.',
    },
    formTitle: 'Content details',
    submitLabel: 'Submit content',
    successTitle: 'Content submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Login page for the article platform.',
      badge: 'Reader and writer access',
      title: 'Welcome back to your reading room.',
      description: 'Login to continue publishing article drafts, managing submissions, and returning to the ideas you are shaping.',
      formTitle: 'Login to your account',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Signup page for this site.',
      badge: 'Join the article desk',
      title: 'Create your account and start publishing articles.',
      description: 'Create an account to enter the publishing workspace, submit article ideas, and build a cleaner presence for your writing.',
      formTitle: 'Create your writer account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested articles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit Official Site',
    },
  },
} as const
