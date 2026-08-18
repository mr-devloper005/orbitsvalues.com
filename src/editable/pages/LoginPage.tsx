import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpenText, FilePenLine, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Login', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[1180px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] opacity-55">{pagesContent.auth.login.badge}</p>
            <h1 className="mt-5 max-w-xl text-5xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-6xl">{pagesContent.auth.login.title}</h1>
            <p className="mt-6 max-w-lg text-sm leading-8 opacity-70">{pagesContent.auth.login.description}</p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                { Icon: BookOpenText, label: 'Return to reading' },
                { Icon: FilePenLine, label: 'Manage drafts' },
                { Icon: Search, label: 'Search faster' },
              ].map(({ Icon, label }) => (
                <div key={label} className="rounded-[1rem] border border-black/[0.06] bg-white/75 p-4">
                  <Icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                  <p className="mt-3 text-sm font-extrabold leading-5">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.35rem] border border-black/[0.06] bg-white/85 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.14)] backdrop-blur sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-[-0.04em]">{pagesContent.auth.login.formTitle}</h2>
            <EditableLocalLoginForm />
            <p className="mt-5 text-sm opacity-70">New here? <Link href="/signup" className="font-extrabold underline-offset-4 hover:underline">{pagesContent.auth.login.createCta}</Link></p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
