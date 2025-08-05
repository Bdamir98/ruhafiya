import { NextRequest, NextResponse } from 'next/server'
import { uploadFileAdmin, STORAGE_BUCKETS } from '@/lib/storage-admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const folder = formData.get('folder') as string | undefined

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!bucket) {
      return NextResponse.json(
        { success: false, error: 'No bucket specified' },
        { status: 400 }
      )
    }

    // Validate bucket name
    const validBuckets = Object.values(STORAGE_BUCKETS)
    if (!validBuckets.includes(bucket as any)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bucket name' },
        { status: 400 }
      )
    }

    // Upload file using admin client (bypasses RLS)
    const result = await uploadFileAdmin(file, bucket, folder)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}