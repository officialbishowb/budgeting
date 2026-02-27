"use client"

import { useState } from "react"
import { type Account, getFaviconUrl } from "@/lib/utils"

interface AccountIconProps {
  account: Account
  size?: number
  className?: string
}

export default function AccountIcon({ account, size = 24, className = "" }: AccountIconProps) {
  const [imgError, setImgError] = useState(false)
  const faviconUrl = account.url ? getFaviconUrl(account.url) : null

  if (faviconUrl && !imgError) {
    return (
      <img
        src={faviconUrl}
        alt={account.name}
        width={size}
        height={size}
        className={`rounded-sm object-contain flex-shrink-0 ${className}`}
        onError={() => setImgError(true)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex-shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: account.color }}
    />
  )
}
