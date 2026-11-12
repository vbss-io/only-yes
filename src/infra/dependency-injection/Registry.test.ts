import { Registry } from '@/infra/dependency-injection/Registry'
import { describe, expect, it } from 'vitest'

describe('Registry', () => {
  it('is a singleton', () => {
    expect(Registry.getInstance()).toBe(Registry.getInstance())
  })

  it('injects what was provided under a name', () => {
    const dependency = { name: 'dep' }
    Registry.getInstance().provide('registry-test-dep', dependency)

    expect(Registry.getInstance().inject('registry-test-dep')).toBe(dependency)
  })

  it('returns undefined for an unknown name', () => {
    expect(Registry.getInstance().inject('registry-test-missing')).toBeUndefined()
  })

  it('replaces a dependency provided twice under the same name', () => {
    Registry.getInstance().provide('registry-test-twice', 1)
    Registry.getInstance().provide('registry-test-twice', 2)

    expect(Registry.getInstance().inject('registry-test-twice')).toBe(2)
  })
})
