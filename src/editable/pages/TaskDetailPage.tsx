import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUp, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink, Eye, FileText, Globe2, Heart, ListOrdered, Mail, MailPlus, MapPin, MessageCircle, Phone, Search, Share2, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { buildPostUrl, fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const stripTags = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const slugifyHeading = (value: string) => stripTags(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) || 'section'

const buildArticleBody = (post: SitePost) => {
  const rawHtml = formatPlainText(getBody(post))
  const toc: Array<{ id: string; text: string }> = []
  const seen = new Map<string, number>()
  const html = rawHtml.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_match, level, attrs, inner) => {
    const text = stripTags(String(inner))
    const base = slugifyHeading(text)
    const count = seen.get(base) || 0
    seen.set(base, count + 1)
    const id = count ? `${base}-${count + 1}` : base
    if (String(level) === '2' && toc.length < 7) toc.push({ id, text })
    const safeAttrs = String(attrs || '').replace(/\s+id=(["']).*?\1/gi, '')
    return `<h${level}${safeAttrs} id="${id}">${inner}</h${level}>`
  })
  return { html, toc }
}

const HTML_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ensp: ' ', emsp: ' ', shy: '',
  hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  laquo: '«', raquo: '»', bull: '•', middot: '·', deg: '°', copy: '©', reg: '®', trade: '™',
  euro: '€', pound: '£', yen: '¥', cent: '¢', times: '×', divide: '÷',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
  agrave: 'à', egrave: 'è', igrave: 'ì', ograve: 'ò', ugrave: 'ù',
  acirc: 'â', ecirc: 'ê', icirc: 'î', ocirc: 'ô', ucirc: 'û',
  atilde: 'ã', otilde: 'õ', ntilde: 'ñ', ccedil: 'ç',
  auml: 'ä', euml: 'ë', iuml: 'ï', ouml: 'ö', uuml: 'ü',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  Acirc: 'Â', Ecirc: 'Ê', Ocirc: 'Ô', Atilde: 'Ã', Otilde: 'Õ', Ccedil: 'Ç',
}

const _fromCodePoint = (code: number, fallback: string) => {
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return fallback
  try { return String.fromCodePoint(code) } catch { return fallback }
}

const _decodeEntities = (value: string) => value
  .replace(/&#x([0-9a-f]+);/gi, (match, hex) => _fromCodePoint(parseInt(hex, 16), match))
  .replace(/&#(\d+);/g, (match, dec) => _fromCodePoint(Number(dec), match))
  .replace(/&([a-z]+\d*);/gi, (match, name) => HTML_ENTITIES[name] ?? HTML_ENTITIES[String(name).toLowerCase()] ?? match)

const _removeTags = (value: string) => value
  .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<\/?(p|div|br|hr|li|ul|ol|tr|td|th|h[1-6]|blockquote|section|article|header|footer|figure|figcaption)\b[^>]*>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')

const toPlainText = (value: unknown) => {
  if (typeof value !== 'string' || !value) return ''
  return _removeTags(_decodeEntities(_removeTags(value))).replace(/\s+/g, ' ').trim()
}

const summaryText = (post: SitePost) => toPlainText(post.summary) || toPlainText(getContent(post).description) || toPlainText(getContent(post).excerpt) || ''
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {

  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-dark-bg)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-4 py-2 text-sm font-extrabold">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  const heroImage = images[0]
  const { html, toc } = buildArticleBody(post)
  const category = categoryOf(post, 'Article')
  const views = Math.max(1400, (post.title.length * 137) % 9200)
  const likes = Math.max(28, (post.title.length * 11) % 480)
  const commentCount = comments.length
  const sharePath = buildPostUrl('article', post.slug)
  const shareUrl = `${slot4BrandConfig.baseUrl.replace(/\/$/, '')}${sharePath.startsWith('/') ? sharePath : `/${sharePath}`}`
  const mailSubject = encodeURIComponent(post.title)
  const mailBody = encodeURIComponent(`${post.title}\n\n${shareUrl}`)
  return (
    <div id="article-top" className="bg-[var(--slot4-page-bg)] text-[var(--slot4-dark-bg)]">
      <section className="relative min-h-[560px] overflow-hidden border-b border-black/[0.08]">
        {heroImage ? <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,243,236,0.16)_0%,rgba(247,243,236,0.74)_60%,#f7f3ec_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,17,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(17,17,17,0.04)_1px,transparent_1px)] bg-[size:84px_84px] opacity-35" />
        <div className="relative mx-auto flex min-h-[560px] max-w-[1180px] flex-col items-center justify-end px-4 pb-16 pt-24 text-center sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
              <FileText className="h-3.5 w-3.5" /> {category}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
              <CheckCircle2 className="h-3.5 w-3.5" /> {slot4BrandConfig.siteName}
            </span>
          </div>
          <h1 className="mt-5 max-w-5xl text-4xl font-extrabold leading-[1] tracking-[-0.06em] sm:text-5xl lg:text-6xl">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-extrabold uppercase tracking-[0.16em] text-black/62">
            <span>By editorial desk</span>
            <span className="h-1 w-1 rounded-full bg-black/35" />
            <span>{category}</span>
            <Link href="#comments" className="inline-flex items-center gap-1 rounded-full bg-white/75 px-3 py-1.5 shadow-sm"><MessageCircle className="h-3.5 w-3.5" /> {commentCount}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[250px_minmax(0,680px)_290px] lg:items-start lg:px-8 lg:py-14">
        <ArticleLeftRail toc={toc} views={views} likes={likes} comments={commentCount} shareUrl={shareUrl} mailSubject={mailSubject} mailBody={mailBody} />

        <article className="min-w-0">
          <div className="rounded-[1.35rem] border border-black/[0.06] bg-white/82 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.14)] sm:p-8">
            <BackLink task="article" />
            <BodyContent html={html} />
            {images[1] ? (
              <figure className="mt-9 overflow-hidden rounded-[1.1rem] border border-black/[0.06] bg-[var(--slot4-page-bg)]">
                <img src={images[1]} alt="" className="max-h-[420px] w-full object-cover" />
                <figcaption className="px-5 py-3 text-center text-xs font-bold text-black/45">Editorial visual from this article</figcaption>
              </figure>
            ) : null}
            <EditableComments slug={post.slug} comments={comments} />
          </div>
        </article>

        <ArticleRightRail related={related} />
      </section>
    </div>
  )
}

function ArticleLeftRail({
  toc,
  views,
  likes,
  comments,
  shareUrl,
  mailSubject,
  mailBody,
}: {
  toc: Array<{ id: string; text: string }>
  views: number
  likes: number
  comments: number
  shareUrl: string
  mailSubject: string
  mailBody: string
}) {
  const tocItems = toc.length ? toc : [{ id: 'article-content', text: 'Article' }]
  return (
    <aside className="space-y-6 lg:sticky lg:top-28">
      <div className="rounded-[1.25rem] border border-black/[0.06] bg-white/72 p-5 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em]">Post activity</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-extrabold text-black/72">
          <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {(views / 1000).toFixed(1)}k</span>
          <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /> {likes}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {comments}</span>
        </div>
      </div>

      <nav className="rounded-[1.25rem] border border-black/[0.06] bg-white/72 p-5 shadow-sm" aria-label="Article table of contents">
        <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em]"><ListOrdered className="h-4 w-4 text-[var(--slot4-accent)]" /> Table of contents</p>
        <ol className="mt-4 grid gap-3 text-sm font-extrabold leading-5">
          {tocItems.map((item, index) => (
            <li key={item.id} className="grid grid-cols-[22px_minmax(0,1fr)] gap-2">
              <span className="text-black/35">{index + 1}.</span>
              <a href={`#${item.id}`} className="underline decoration-black/20 underline-offset-4 transition hover:text-[var(--slot4-accent)]">{item.text}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="rounded-[1.25rem] border border-black/[0.06] bg-white/72 p-5 shadow-sm">
        <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em]"><Share2 className="h-4 w-4 text-[var(--slot4-accent)]" /> Share this post</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`mailto:?subject=${mailSubject}&body=${mailBody}`} className="rounded-full border border-black/[0.06] bg-[var(--slot4-surface-bg)] px-3 py-2 text-xs font-extrabold">Email</a>
          <a href={`https://twitter.com/intent/tweet?text=${mailSubject}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="rounded-full border border-black/[0.06] bg-[var(--slot4-surface-bg)] px-3 py-2 text-xs font-extrabold">X</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="rounded-full border border-black/[0.06] bg-[var(--slot4-surface-bg)] px-3 py-2 text-xs font-extrabold">Fb</a>
        </div>
        <a href="#article-top" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-black/55 transition hover:text-[var(--slot4-accent)]">
          Back to top <ArrowUp className="h-4 w-4 rounded-full bg-black/10 p-0.5" />
        </a>
      </div>
    </aside>
  )
}

function ArticleRightRail({ related }: { related: SitePost[] }) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-28">
      <form action="/search" className="rounded-[1.25rem] border border-black/[0.06] bg-white/72 p-5 shadow-sm">
        <label className="text-xs font-extrabold uppercase tracking-[0.2em]" htmlFor="article-detail-search">Search</label>
        <div className="mt-3 flex rounded-[1rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-2">
          <input id="article-detail-search" name="q" placeholder="Enter keywords..." className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none placeholder:text-black/35" />
          <button type="submit" aria-label="Search articles" className="inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-[var(--slot4-accent)] text-white transition hover:opacity-90">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="rounded-[1.25rem] border border-black/[0.06] bg-white/72 p-6 shadow-sm">
        <MailPlus className="h-7 w-7 text-[var(--slot4-accent)]" />
        <h2 className="mt-5 text-xl font-extrabold tracking-[-0.04em]">Get exclusive access</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-black/62">Subscribe for premium article updates, editorial picks, and deeper reading paths.</p>
        <Link href="/signup" className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[var(--slot4-accent)]">
          Sign up <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {related.length ? (
        <div className="rounded-[1.25rem] border border-black/[0.06] bg-white/72 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold tracking-[-0.04em]">Read also</h2>
            <Link href="/article" className="text-xs font-extrabold uppercase tracking-[0.16em] text-black/45 hover:text-[var(--slot4-accent)]">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.slice(0, 5).map((item) => <RelatedCard key={item.id || item.slug} task="article" post={item} />)}
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <BackLink task="listing" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <article className="rounded-[2.8rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-9">
          <div className="grid gap-6 sm:grid-cols-[150px_1fr]">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-[2rem] bg-[var(--slot4-page-bg)] ring-1 ring-black/[0.06]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-14 w-14 opacity-40" />}
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Business listing</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-6xl">{post.title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 opacity-70">{summaryText(post)}</p>
            </div>
          </div>
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Business showcase" />
        </article>
        <aside className="space-y-5">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : <ContactAction website={website} phone={phone} email={email} />}
          {mapSrc ? <ContactAction website={website} phone={phone} email={email} /> : null}
          <RelatedPanel task="listing" post={post} related={related} compact />
        </aside>
      </div>
    </section>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <section className="mx-auto grid max-w-[1180px] gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-16">
      <aside className="rounded-[2.5rem] border border-black/[0.06] bg-[var(--slot4-dark-bg)] p-7 text-[var(--slot4-page-bg)] shadow-xl lg:sticky lg:top-24 lg:self-start">
        <BackLink task="classified" />
        <p className="mt-10 text-xs font-extrabold uppercase tracking-[0.28em] opacity-60">Classified notice</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-5xl">{post.title}</h1>
        <div className="mt-8 grid gap-3">
          {price ? <BadgeLine label="Price" value={price} /> : null}
          {condition ? <BadgeLine label="Condition" value={condition} /> : null}
          {location ? <BadgeLine label="Location" value={location} /> : null}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {phone ? <a href={`tel:${phone}`} className="rounded-full bg-[var(--slot4-page-bg)] px-5 py-3 text-sm font-extrabold text-[var(--slot4-dark-bg)]">Call now</a> : null}
          {email ? <a href={`mailto:${email}`} className="rounded-full border border-white/25 px-5 py-3 text-sm font-extrabold">Email</a> : null}
        </div>
      </aside>
      <article className="rounded-[2.7rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-9">
        <ImageStrip images={images} label="Offer images" large />
        <BodyContent post={post} />
        <ContactAction website={website} phone={phone} email={email} />
        <RelatedPanel task="classified" post={post} related={related} />
      </article>
    </section>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  return (
    <section className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <BackLink task="image" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="rounded-[2.5rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-7 lg:sticky lg:top-24 lg:self-start">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-dark-bg)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--slot4-page-bg)]"><Camera className="h-4 w-4" /> Image story</div>
          <h1 className="mt-6 text-4xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-base leading-8 opacity-70">{summaryText(post)}</p>
          <BodyContent post={post} compact />
        </aside>
        <div className="columns-1 gap-5 space-y-5 md:columns-2">
          {(images.length ? images : ['/placeholder.svg?height=900&width=1200']).map((image, index) => (
            <figure key={`${image}-${index}`} className="break-inside-avoid overflow-hidden rounded-[2rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] shadow-sm">
              <img src={image} alt="" className="w-full object-cover" />
              {index === 0 ? <figcaption className="p-5 text-sm font-bold opacity-65">Featured visual from this image post.</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-10"><RelatedPanel task="image" post={post} related={related} /></div>
    </section>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <section className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-16">
      <article className="rounded-[2.7rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-10">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[var(--slot4-dark-bg)] text-[var(--slot4-page-bg)]"><Bookmark className="h-9 w-9" /></div>
        <h1 className="mt-7 text-4xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-6xl">{post.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-9 opacity-70">{summaryText(post)}</p>
        {website ? <Link href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-dark-bg)] px-5 py-3 text-sm font-extrabold text-[var(--slot4-page-bg)]">Open saved resource <ExternalLink className="h-4 w-4" /></Link> : null}
        <BodyContent post={post} />
      </article>
      <RelatedPanel task="sbm" post={post} related={related} />
    </section>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-16">
      <article className="rounded-[2.7rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-9">
        <BackLink task="pdf" />
        <div className="mt-8 grid gap-6 sm:grid-cols-[120px_1fr]">
          <div className="flex h-28 w-28 items-center justify-center rounded-[1.8rem] bg-[var(--slot4-dark-bg)] text-[var(--slot4-page-bg)]"><FileText className="h-12 w-12" /></div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">PDF resource</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-6xl">{post.title}</h1>
          </div>
        </div>
        <BodyContent post={post} />
        {fileUrl ? (
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-black/[0.06] bg-[var(--slot4-page-bg)]">
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] bg-[var(--slot4-surface-bg)] p-4">
              <span className="text-sm font-extrabold">Document preview</span>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-dark-bg)] px-4 py-2 text-xs font-extrabold text-[var(--slot4-page-bg)]">Download <Download className="h-4 w-4" /></Link>
            </div>
            <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full" />
          </div>
        ) : null}
      </article>
      <RelatedPanel task="pdf" post={post} related={related} />
    </section>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <section className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:px-8 lg:py-16">
      <aside className="rounded-[2.7rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.08)] lg:sticky lg:top-24 lg:self-start">
        <BackLink task="profile" />
        <div className="mx-auto mt-10 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-[var(--slot4-page-bg)] ring-1 ring-black/[0.06]">
          {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-16 w-16 opacity-45" />}
        </div>
        <h1 className="mt-6 text-4xl font-extrabold leading-[0.98] tracking-[-0.07em]">{post.title}</h1>
        {role ? <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{role}</p> : null}
        <ContactAction website={website} email={email} />
      </aside>
      <article className="rounded-[2.7rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-7 shadow-sm sm:p-10">
        <BodyContent post={post} />
        <ImageStrip images={images.slice(1)} label="Profile gallery" />
        <RelatedPanel task="profile" post={post} related={related} />
      </article>
    </section>
  )
}

function BodyContent({ post, html, compact = false }: { post?: SitePost; html?: string; compact?: boolean }) {
  const content = html || (post ? formatPlainText(getBody(post)) : '')
  return <div id="article-content" className={`article-content mt-8 max-w-none ${compact ? 'text-base leading-8' : 'text-[1.05rem] leading-9'} opacity-80`} dangerouslySetInnerHTML={{ __html: content }} />
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[1.5rem] border border-black/[0.06] bg-[var(--slot4-page-bg)] p-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] opacity-55"><Icon className="h-4 w-4" /> {label}</div>
          <p className="mt-2 break-words text-sm font-bold leading-6 opacity-80">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[1.4rem] object-cover ring-1 ring-black/[0.06]" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] shadow-sm">
      <div className="flex items-center gap-2 p-4 text-sm font-extrabold"><MapPin className="h-4 w-4" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-80 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email }: { website?: string; phone?: string; email?: string }) {
  if (!website && !phone && !email) return null
  return (
    <div className="mt-5 rounded-[2rem] border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-5 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] opacity-55">Quick actions</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-dark-bg)] px-4 py-2 text-sm font-extrabold text-[var(--slot4-page-bg)]">Website <ExternalLink className="h-4 w-4" /></Link> : null}
        {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] px-4 py-2 text-sm font-extrabold"><Phone className="h-4 w-4" /> Call</a> : null}
        {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] px-4 py-2 text-sm font-extrabold"><Mail className="h-4 w-4" /> Email</a> : null}
      </div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm"><span className="font-extrabold uppercase tracking-[0.16em] opacity-60">{label}</span><span className="font-extrabold">{value}</span></div>
}

function RelatedPanel({ task, post: _post, related, compact = false }: { task: TaskKey; post: SitePost; related: SitePost[]; compact?: boolean }) {
  const taskConfig = getTaskConfig(task)
  return (
    <aside className="min-w-0 space-y-5">
      {!compact ? (
        <div className="rounded-[1.25rem] border border-black/[0.06] bg-white/75 p-5 backdrop-blur">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] opacity-55">About this post</p>
          <div className="mt-4 grid gap-3 text-sm font-bold opacity-75">
            <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4" /> Task: {taskConfig?.label || task}</p>
            <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Site: {slot4BrandConfig.siteName}</p>
          </div>
        </div>
      ) : null}
      {related.length ? (
        <div className="rounded-[1.25rem] border border-black/[0.06] bg-white/75 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold tracking-[-0.04em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-xs font-extrabold uppercase tracking-[0.16em] opacity-55">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function RelatedCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const image = getImages(post)[0]
  return (
    <Link href={buildPostUrl(task, post.slug)} className="group flex gap-3 rounded-2xl border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-3 transition hover:-translate-y-0.5 hover:shadow-lg">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[var(--slot4-page-bg)]"><FileText className="h-6 w-6 opacity-45" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-3 text-sm font-extrabold leading-tight tracking-[-0.03em]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 opacity-60">{summaryText(post)}</p>
      </div>
    </Link>
  )
}

function EditableComments({ slug, comments }: { slug: string; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <section id="comments" className="mt-10 rounded-[2rem] border border-black/[0.06] bg-white/70 p-5">
      <div className="flex items-center gap-2 text-lg font-extrabold"><MessageCircle className="h-5 w-5" /> Comments</div>
      <div className="mt-5 grid gap-3">
        {comments.slice(0, 5).map((comment) => (
          <div key={comment.id} className="rounded-2xl border border-black/[0.06] bg-[var(--slot4-surface-bg)] p-4">
            <p className="text-sm font-extrabold">{comment.name}</p>
            <p className="mt-2 text-sm leading-6 opacity-70">{comment.comment}</p>
          </div>
        ))}
        {!comments.length ? <p className="text-sm opacity-60">No comments yet for {slug}.</p> : null}
      </div>
    </section>
  )
}
