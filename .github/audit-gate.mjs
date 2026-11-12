import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const allowlistPath = join(repoRoot, '.github', 'audit-allowlist.json')
const DAY_MS = 86_400_000
const WARN_WITHIN_DAYS = 3
const MAX_UNTIL_DAYS = 30

const isRealDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

const daysUntil = (date, today) => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS)

const readAllowlist = (today) => {
  const entries = JSON.parse(readFileSync(allowlistPath, 'utf8'))
  for (const entry of entries) {
    if (!entry.ghsa || !entry.module || !entry.reason || !isRealDate(entry.until)) {
      throw new Error(`Invalid allowlist entry: ${JSON.stringify(entry)}`)
    }
    if (daysUntil(entry.until, today) > MAX_UNTIL_DAYS) {
      throw new Error(
        `Allowlist entry ${entry.module} ${entry.ghsa} expires ${entry.until}, more than ${MAX_UNTIL_DAYS} days ahead`
      )
    }
  }
  return entries
}

const readAdvisories = () => {
  if (!existsSync(join(repoRoot, 'yarn.lock'))) throw new Error(`yarn.lock not found in ${repoRoot}`)
  const audit = spawnSync('yarn', ['audit', '--groups', 'dependencies', '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 64 * 1024 * 1024
  })
  if (audit.error) throw audit.error
  const advisories = new Map()
  let summarySeen = false
  for (const line of audit.stdout.split('\n')) {
    if (!line.trim()) continue
    const event = JSON.parse(line)
    if (event.type === 'auditSummary') {
      if (!(event.data.totalDependencies > 0)) throw new Error('yarn audit inspected no dependencies')
      summarySeen = true
    }
    if (event.type !== 'auditAdvisory') continue
    const advisory = event.data.advisory
    const key = advisory.github_advisory_id
    const current = advisories.get(key) ?? {
      ghsa: key,
      module: advisory.module_name,
      severity: advisory.severity,
      title: advisory.title,
      paths: new Set()
    }
    current.paths.add(event.data.resolution.path)
    advisories.set(key, current)
  }
  if (!summarySeen) throw new Error(`yarn audit produced no summary (exit ${audit.status}): ${audit.stderr}`)
  return [...advisories.values()]
}

const today = new Date().toISOString().slice(0, 10)
const allowlist = readAllowlist(today)
const advisories = readAdvisories()
const failures = []

for (const advisory of advisories) {
  const entry = allowlist.find((item) => item.ghsa === advisory.ghsa && item.module === advisory.module)
  const where = [...advisory.paths].slice(0, 3).join(', ')
  if (!entry) {
    failures.push(`NOT ALLOWED ${advisory.severity} ${advisory.module} ${advisory.ghsa} (${where}): ${advisory.title}`)
  } else if (entry.until < today) {
    failures.push(`EXPIRED ${advisory.module} ${advisory.ghsa} (${where}) allowed until ${entry.until}: ${entry.reason}`)
  } else {
    console.log(`allowed until ${entry.until}: ${advisory.severity} ${advisory.module} ${advisory.ghsa} (${where})`)
    const remaining = daysUntil(entry.until, today)
    if (remaining <= WARN_WITHIN_DAYS) {
      console.log(
        `::warning::audit exception for ${advisory.module} ${advisory.ghsa} expires ${entry.until} (${remaining} days left)`
      )
    }
  }
}

for (const entry of allowlist) {
  if (!advisories.some((advisory) => advisory.ghsa === entry.ghsa)) {
    console.log(`unused allowlist entry, remove it: ${entry.module} ${entry.ghsa}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure)
  process.exit(1)
}
console.log(`audit gate passed: ${advisories.length} advisories, all allowed`)
