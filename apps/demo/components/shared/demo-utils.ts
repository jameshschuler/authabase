import type { ApiCallResponse } from './demo-config'

export async function parseResponseBody(res: Response): Promise<unknown> {
  const contentLength = res.headers.get('content-length')
  const contentType = res.headers.get('content-type') ?? ''
  const hasBody = contentLength !== '0'

  if (!hasBody) return null

  if (contentType.includes('application/json')) {
    return res.json().catch(() => null)
  }

  return res.text().catch(() => '')
}

export function formatResponse(response: ApiCallResponse | null): string {
  if (!response) return 'No call yet.'

  const lines = [
    `${response.method} ${response.url}`,
    `Status: ${response.status} (${response.ok ? 'OK' : 'Error'})`,
    `Timestamp: ${response.timestamp}`,
    '',
    'Body:',
    typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2),
  ]

  return lines.join('\n')
}
