import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { slot4BrandConfig } from '@/editable/theme/brand.config'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] px-4 py-14 text-[var(--slot4-page-text)] sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[1.35rem] border border-black/[0.06] bg-white/85 p-8 shadow-sm lg:p-11">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] opacity-55">{pagesContent.about.badge}</p>
            <h1 className="mt-5 max-w-2xl text-5xl font-extrabold leading-[0.98] tracking-[-0.07em]">About {slot4BrandConfig.siteName}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 opacity-70">{pagesContent.about.description}</p>
            <div className="mt-8 space-y-4 text-sm leading-8 opacity-75">
              {pagesContent.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {['Editorial clarity', 'Useful context', 'Comfortable reading'].map((item) => (
                <div key={item} className="rounded-[1rem] border border-black/[0.06] bg-[var(--slot4-page-bg)] p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">Principle</p>
                  <p className="mt-2 text-sm font-extrabold leading-5">{item}</p>
                </div>
              ))}
            </div>
          </article>
          <aside className="space-y-4">
            {pagesContent.about.values.map((value) => (
              <div key={value.title} className="rounded-[1.25rem] border border-black/[0.06] bg-white/75 p-6 shadow-sm">
                <h2 className="text-xl font-extrabold tracking-[-0.04em]">{value.title}</h2>
                <p className="mt-3 text-sm leading-7 opacity-70">{value.description}</p>
              </div>
            ))}
            <div className="rounded-[1.25rem] bg-[var(--slot4-dark-bg)] p-6 text-white">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/45">What we publish</p>
              <p className="mt-4 text-2xl font-extrabold leading-tight tracking-[-0.04em]">Articles that help readers understand a topic, compare ideas, and decide what to read next.</p>
            </div>
          </aside>
        </section>
      </main>
    </EditableSiteShell>
  )
}
