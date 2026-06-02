'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { slot4BrandConfig } from '@/editable/theme/brand.config'

export function EditableFooter() {
  const footerVars = { '--editable-footer-bg': '#111111', '--editable-footer-text': '#ffffff' } as CSSProperties
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer style={footerVars} className="bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[0.9rem] border border-white/10 bg-white">
              <img src="/favicon.png?v=20260602" alt={slot4BrandConfig.siteName} className="h-9 w-9 object-contain" />
            </span>
            <span className="text-lg font-black tracking-[-0.04em]">{slot4BrandConfig.siteName}</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/68">{globalContent.footer?.description || SITE_CONFIG.description}</p>
          <p className="mt-5 max-w-sm text-xs font-bold uppercase tracking-[0.18em] text-white/35">Articles, essays, explainers, and useful reading paths.</p>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.22em] text-white/45">Explore</h3>
          <div className="mt-4 grid gap-2">
            {taskLinks.map((task) => (
              <Link key={task.key} href={task.route} className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white">
                {task.label} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.22em] text-white/45">Site</h3>
          <div className="mt-4 grid gap-2">
            {[
              ['About', '/about'],
              ['Contact', '/contact'],
              ...(session ? [['Create', '/create']] : [['Login', '/login'], ['Sign up', '/signup']]),
            ].map(([label, href]) => (
              <Link key={href} href={href} className="text-sm font-bold text-white/70 hover:text-white">{label}</Link>
            ))}
            {session ? <button type="button" onClick={logout} className="text-left text-sm font-bold text-white/70 hover:text-white">Logout {session.name}</button> : null}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs font-bold text-white/45">
        © {year} {slot4BrandConfig.siteName}. All rights reserved.
      </div>
    </footer>
  )
}
