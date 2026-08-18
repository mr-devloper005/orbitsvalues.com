import type { Metadata } from 'next'
import Link from 'next/link'
import { BookMarked, PenTool, UsersRound } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Sign up', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[1180px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8">
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.08] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.14)] backdrop-blur sm:p-8">
            <h1 className="text-3xl font-extrabold tracking-[-0.05em]">{pagesContent.auth.signup.formTitle}</h1>
            <EditableLocalSignupForm />
            <p className="mt-5 text-sm text-white/65">Already have an account? <Link href="/login" className="font-extrabold text-white underline-offset-4 hover:underline">{pagesContent.auth.signup.loginCta}</Link></p>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-white/60">{pagesContent.auth.signup.badge}</p>
            <h2 className="mt-5 max-w-xl text-5xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-6xl">{pagesContent.auth.signup.title}</h2>
            <p className="mt-6 max-w-lg text-sm leading-8 text-white/68">{pagesContent.auth.signup.description}</p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                { Icon: PenTool, label: 'Submit articles' },
                { Icon: BookMarked, label: 'Build your archive' },
                { Icon: UsersRound, label: 'Join contributors' },
              ].map(({ Icon, label }) => (
                <div key={label} className="rounded-[1rem] border border-white/10 bg-white/[0.07] p-4">
                  <Icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                  <p className="mt-3 text-sm font-extrabold leading-5 text-white">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
