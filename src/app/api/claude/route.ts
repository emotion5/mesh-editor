import { NextRequest, NextResponse } from 'next/server'

interface ClaudeRequestBody {
  model?: string
  max_tokens?: number
  system?: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

interface ClaudeResponse {
  content: Array<{
    type: string
    text: string
  }>
  id: string
  model: string
  role: string
  stop_reason: string
  stop_sequence: string | null
  type: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { 
        error: 'API key not configured',
        message: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.'
      },
      { status: 500 }
    )
  }

  try {
    const body: ClaudeRequestBody = await request.json()
    const { model, max_tokens, system, messages } = body

    console.log('🚀 Claude API 호출 중...')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-haiku-20240307',
        max_tokens: max_tokens || 1024,
        system: system,
        messages: messages
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Claude API 오류:', response.status, errorText)
      return NextResponse.json(
        {
          error: 'Claude API error',
          message: `API 호출 실패: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data: ClaudeResponse = await response.json()
    console.log('✅ Claude API 응답 성공')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ 서버 오류:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: '서버에서 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}