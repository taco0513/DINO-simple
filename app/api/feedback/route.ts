import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('Feedback API called')
  console.log('Environment variables check:')
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
  console.log('FEEDBACK_EMAIL:', process.env.FEEDBACK_EMAIL)
  
  try {
    const body = await request.json()
    console.log('Request body received:', { 
      feedbackType: body.feedbackType,
      messageLength: body.message?.length,
      hasScreenshot: !!body.screenshot,
      userEmail: body.userEmail 
    })
    
    const { feedbackType, message, screenshot, userEmail, pageUrl, userAgent } = body
    
    // Basic validation
    if (!message || message.trim().length < 10) {
      console.log('Message validation failed:', { message, length: message?.length })
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      )
    }

    // Send email if Resend API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        const emailResult = await resend.emails.send({
          from: 'onboarding@resend.dev', // Resend's test domain (no custom name allowed)
          to: process.env.FEEDBACK_EMAIL || 'hello@zimojin.com',
          subject: `[DINO Beta] ${feedbackType} feedback from ${userEmail}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">New Beta Feedback Received</h2>
              
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Type:</strong> ${feedbackType.toUpperCase()}</p>
                <p style="margin: 5px 0;"><strong>From:</strong> ${userEmail}</p>
                <p style="margin: 5px 0;"><strong>Page:</strong> <a href="${pageUrl}">${pageUrl}</a></p>
              </div>
              
              <div style="background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                <h3 style="margin-top: 0;">Message:</h3>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              
              ${screenshot ? `
                <div style="margin-top: 20px;">
                  <p><strong>📸 Screenshot attached</strong></p>
                  <p style="font-size: 12px; color: #666;">Note: Screenshot saved to Supabase Storage</p>
                </div>
              ` : ''}
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
              <p style="font-size: 11px; color: #999;">
                User Agent: ${userAgent}<br>
                Sent from DINO Beta Feedback System
              </p>
            </div>
          `,
          attachments: screenshot ? [{
            filename: 'screenshot.png',
            content: screenshot.split(',')[1] // Remove data:image/png;base64, prefix
          }] : undefined
        })
        
        console.log('Feedback email sent successfully!')
        console.log('Email ID:', emailResult.id)
        console.log('Sent to:', process.env.FEEDBACK_EMAIL || 'hello@zimojin.com')
      } catch (emailError: any) {
        console.error('Email sending failed:', emailError)
        console.error('Error details:', {
          message: emailError.message,
          statusCode: emailError.statusCode,
          name: emailError.name
        })
        // Continue even if email fails - we still save to database
      }
    }

    // For now, just log it (you can see in Vercel Functions logs)
    console.log('Feedback received:', {
      type: feedbackType,
      from: userEmail,
      message: message,
      hasScreenshot: !!screenshot,
      page: pageUrl
    })

    // Alternative: Save to Supabase directly from API route
    // This is better for security as it doesn't expose Supabase to client
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      // Upload screenshot if provided
      let screenshotUrl = null
      if (screenshot) {
        const base64Data = screenshot.split(',')[1]
        const buffer = Buffer.from(base64Data, 'base64')
        const fileName = `feedback/${Date.now()}.png`
        
        const { data: uploadData } = await supabase.storage
          .from('feedback-screenshots')
          .upload(fileName, buffer, {
            contentType: 'image/png',
            cacheControl: '3600'
          })
        
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('feedback-screenshots')
            .getPublicUrl(fileName)
          screenshotUrl = publicUrl
        }
      }

      // Save to database
      await supabase
        .from('feedback')
        .insert({
          feedback_type: feedbackType,
          message: message,
          screenshot_url: screenshotUrl,
          user_email: userEmail,
          page_url: pageUrl,
          user_agent: userAgent
        })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { error: 'Failed to process feedback', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}