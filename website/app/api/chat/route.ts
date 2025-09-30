import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  user_input: string;
  thread_id: string;
}

interface ChatResponse {
  data: string;
  thread_id: string;
  status: 'success' | 'error';
  error?: string;
}

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.user_input) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'user_input is required'
        },
        { status: 400 }
      );
    }

    const thread_id = body.thread_id || `thread_${crypto.randomUUID()}`;

    const fastApiRequest = {
      user_input: body.user_input,
      thread_id: thread_id,
    };

    console.log('Sending request to FastAPI:', fastApiRequest);

    // Make request to FastAPI endpoint
    const response = await fetch(`${FASTAPI_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fastApiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FastAPI error response:', errorText);

      return NextResponse.json(
        {
          status: 'error',
          error: `FastAPI error: ${response.status} - ${errorText}`
        },
        { status: response.status }
      );
    }

    const data = await response.text();
    console.log('Received response from FastAPI:', data);

    const chatResponse: ChatResponse = {
      data: data,
      thread_id: thread_id,
      status: 'success',
    };

    return NextResponse.json(chatResponse, { status: 200 });

  } catch (error) {
    console.error('API route error:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
