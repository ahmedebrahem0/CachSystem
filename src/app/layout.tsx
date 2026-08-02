import type { Metadata, Viewport } from "next"

import { AppProviders } from "@/components/providers/AppProviders"
import { siteConfig } from "@/config/site"
import "./globals.css"

export const metadata: Metadata = {
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
  },
}

export const viewport: Viewport = {
  themeColor: "#126b55",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
