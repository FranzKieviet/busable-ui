const LEVELS: Record<string, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  none: 100,
}

function getConfiguredLevel(): number {
  // client-side reads NEXT_PUBLIC_LOG_LEVEL, server can read LOG_LEVEL
  const raw = typeof window === 'undefined' ? process.env.LOG_LEVEL : process.env.NEXT_PUBLIC_LOG_LEVEL
  const key = (raw || 'info').toLowerCase()
  return LEVELS[key] ?? LEVELS.info
}

function format(prefix: string, args: any[]) {
  const time = new Date().toISOString()
  return [`${time} ${prefix}`].concat(args)
}

function makeLogger(prefix = '') {
  const level = getConfiguredLevel()

  return {
    debug: (...args: any[]) => {
      if (level <= LEVELS.debug) console.debug(...format(prefix ? `[${prefix}] DEBUG:` : 'DEBUG:', args))
    },
    info: (...args: any[]) => {
      if (level <= LEVELS.info) console.info(...format(prefix ? `[${prefix}] INFO:` : 'INFO:', args))
    },
    warn: (...args: any[]) => {
      if (level <= LEVELS.warn) console.warn(...format(prefix ? `[${prefix}] WARN:` : 'WARN:', args))
    },
    error: (...args: any[]) => {
      if (level <= LEVELS.error) console.error(...format(prefix ? `[${prefix}] ERROR:` : 'ERROR:', args))
    },
  }
}

const root = makeLogger('app')

export default root
export const getLogger = (name: string) => makeLogger(name)
