import { describe, expect, it } from 'vitest'
import { getClientIp } from '@/lib/rate-limit/ip-extractor'

describe('getClientIp', () => {
  it('x-forwarded-forヘッダーから最左端のIPを抽出する', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1' }
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })

  it('x-forwarded-forヘッダーが単一IPの場合、そのIPを返す', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.1' }
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })

  it('x-forwarded-forヘッダーに空白が含まれる場合、トリミングして返す', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '  203.0.113.1  , 198.51.100.1' }
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })

  it('x-real-ipヘッダーをフォールバックとして使用する', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-real-ip': '203.0.113.1' }
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })

  it('x-real-ipヘッダーに空白が含まれる場合、トリミングして返す', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-real-ip': '  203.0.113.1  ' }
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })

  it('両方のヘッダーがある場合、x-forwarded-forを優先する', () => {
    const req = new Request('http://example.com', {
      headers: {
        'x-forwarded-for': '203.0.113.1',
        'x-real-ip': '198.51.100.1'
      }
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })

  it('ヘッダーがない場合はデフォルトIPを返す', () => {
    const req = new Request('http://example.com')
    expect(getClientIp(req)).toBe('127.0.0.1')
  })

  it('空のx-forwarded-forヘッダーの場合、x-real-ipをフォールバックする', () => {
    const req = new Request('http://example.com', {
      headers: {
        'x-forwarded-for': '',
        'x-real-ip': '203.0.113.1'
      }
    })
    expect(getClientIp(req)).toBe('203.0.113.1')
  })

  it('空のx-real-ipヘッダーの場合、デフォルトIPを返す', () => {
    const req = new Request('http://example.com', {
      headers: { 'x-real-ip': '' }
    })
    expect(getClientIp(req)).toBe('127.0.0.1')
  })
})
