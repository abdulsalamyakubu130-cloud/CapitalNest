import { useEffect, useState } from 'react'

const normalizePath = (rawPath) => {
  if (!rawPath || rawPath === '#') return '/'
  const withoutHash = rawPath.startsWith('#') ? rawPath.slice(1) : rawPath
  if (!withoutHash.startsWith('/')) return `/${withoutHash}`
  return withoutHash || '/'
}

export const getCurrentPath = () => {
  if (typeof window === 'undefined') return '/'
  return normalizePath(window.location.hash)
}

export const navigateTo = (path, { replace = false } = {}) => {
  if (typeof window === 'undefined') return
  const normalized = normalizePath(path)
  const targetHash = `#${normalized}`

  if (replace) {
    const base = `${window.location.pathname}${window.location.search}`
    window.history.replaceState({}, '', `${base}${targetHash}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }

  window.location.hash = normalized
}

export const useHashPath = () => {
  const [path, setPath] = useState(getCurrentPath())

  useEffect(() => {
    const onHashChange = () => {
      setPath(getCurrentPath())
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return path
}
