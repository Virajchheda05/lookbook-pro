import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { imageData, location } = await request.json();

    console.log('📝 Generating Instagram caption for:', location);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a creative social media caption writer for travel and fashion influencers.

TASK: Generate an engaging Instagram caption for this image showing someone at ${location}.

REQUIREMENTS:
1. Start with a relevant emoji
2. Write 2-3 short sentences about the experience/location
3. Make it authentic and inspiring (not overly promotional)
4. Include 8-12 relevant hashtags at the end
5. Use popular travel and fashion hashtags
6. Keep total length under 200 characters before hashtags

STYLE: Casual, friendly, inspirational, Instagram-friendly

Generate the caption now:`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageData
        }
      }
    ]);

    const response = await result.response;
    const caption = response.text().trim();

    console.log('✅ Caption generated:', caption);

    return NextResponse.json({
      success: true,
      caption
    });

  } catch (error) {
    console.error('❌ Caption Generation Error:', error);
    
    // Fallback caption
    const locationName = location.split(',')[0].trim();
    const fallbackCaption = `📍 ${location}\n\n✨ Living my best life in this incredible place! The vibes here are unmatched. 💫\n\n#Travel #Wanderlust #${locationName.replace(/\s+/g, '')} #TravelGram #InstaTravel #ExploreMore #AdventureTime #TravelPhotography #Globetrotter #TravelGoals #OOTD #FashionTravel`;
    
    return NextResponse.json({
      success: true,
      caption: fallbackCaption
    });
  }
}