import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { userImageUrl, backgroundImageUrl, customization } = await request.json();

    if (!userImageUrl || !backgroundImageUrl) {
      return NextResponse.json(
        { success: false, error: 'User image and background image are required' },
        { status: 400 }
      );
    }

    console.log('🌍 Starting Globetrotter fusion...');

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ NEXT_PUBLIC_GEMINI_API_KEY is not set!');
      throw new Error('API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    // Fetch images
    console.log('📥 Fetching user image...');
    const userImageResponse = await fetch(userImageUrl);
    const userImageBuffer = await userImageResponse.arrayBuffer();
    const userImageBase64 = Buffer.from(userImageBuffer).toString('base64');

    console.log('📥 Fetching background image...');
    const backgroundImageResponse = await fetch(backgroundImageUrl);
    const backgroundImageBuffer = await backgroundImageResponse.arrayBuffer();
    const backgroundImageBase64 = Buffer.from(backgroundImageBuffer).toString('base64');

    // Extract customization settings
    const {
      position = 'center',
      scale = 'normal',
      timeOfDay = 'current',
      weather = 'clear',
      style = 'realistic'
    } = customization || {};

    // Build detailed customization instructions
    let positionInstruction = '';
    if (position === 'left') {
      positionInstruction = 'Position the person towards the left third of the image, but ensure they look naturally placed and not awkwardly positioned. Adjust slightly if needed for better composition.';
    } else if (position === 'right') {
      positionInstruction = 'Position the person towards the right third of the image, but ensure they look naturally placed and not awkwardly positioned. Adjust slightly if needed for better composition.';
    } else {
      positionInstruction = 'Position the person in or near the center of the image, but prioritize natural placement over exact centering. Adjust for best visual composition.';
    }

    let scaleInstruction = '';
    if (scale === 'closer') {
      scaleInstruction = 'Make the person appear closer to the camera, as if they are in the foreground of the scene. Scale them to roughly 60-70% of the image height.';
    } else if (scale === 'farther') {
      scaleInstruction = 'Make the person appear farther from the camera, as if they are deeper in the scene. Scale them to roughly 30-40% of the image height.';
    } else {
      scaleInstruction = 'Scale the person to appear at a natural middle distance, roughly 45-55% of the image height.';
    }

    let timeOfDayInstruction = '';
    if (timeOfDay === 'morning') {
      timeOfDayInstruction = 'Apply soft, warm morning light (golden hour feel, soft shadows, gentle highlights). Adjust all lighting to create an early morning atmosphere.';
    } else if (timeOfDay === 'noon') {
      timeOfDayInstruction = 'Apply bright, direct midday sunlight (harsh shadows, strong highlights, high contrast). Make it look like noon with overhead sun.';
    } else if (timeOfDay === 'golden-hour') {
      timeOfDayInstruction = 'Apply warm golden hour lighting (orange-yellow tones, long soft shadows, warm glow). Create that magical sunset/sunrise light quality.';
    } else if (timeOfDay === 'night') {
      timeOfDayInstruction = 'Apply night-time lighting (darker tones, artificial light sources, cooler colors, subtle rim lighting). Make it clearly nighttime.';
    } else {
      timeOfDayInstruction = 'Match the current lighting conditions of the background image naturally.';
    }

    let weatherInstruction = '';
    if (weather === 'cloudy') {
      weatherInstruction = 'Add soft, diffused lighting as if it\'s a cloudy day (minimal shadows, even lighting, slightly muted colors).';
    } else if (weather === 'rainy') {
      weatherInstruction = 'Add wet surfaces, rain droplets in air if appropriate, darker tones, and moody atmosphere. Make it look like it just rained or is raining.';
    } else if (weather === 'snowy') {
      weatherInstruction = 'Add snow elements if appropriate to the scene, cooler color temperature, crisp clear air quality. Make it feel like a cold snowy day.';
    } else {
      weatherInstruction = 'Clear weather with natural lighting and visibility.';
    }

    let styleInstruction = '';
    if (style === 'cinematic') {
      styleInstruction = 'Apply a cinematic look with enhanced depth of field, color grading, and dramatic lighting. Make it look like a movie scene.';
    } else if (style === 'vintage') {
      styleInstruction = 'Apply a vintage film look with slightly faded colors, subtle grain, and nostalgic warmth. Make it look like an old photograph.';
    } else if (style === 'vibrant') {
      styleInstruction = 'Enhance colors to be more vibrant and saturated, increase contrast slightly, make everything pop. Create an eye-catching, colorful result.';
    } else {
      styleInstruction = 'Maintain photorealistic quality with natural colors and lighting.';
    }

    // IMPROVED PROMPT FOR GLOBETROTTER
    // IMPROVED PROMPT FOR GLOBETROTTER WITH POSE ADJUSTMENT
    const prompt = `You are an expert photo composition AI specializing in realistic background replacement and integration. Your task is to place the EXACT PERSON from the first image into the location shown in the second image (background), making it look like they are ACTUALLY THERE in that location - not photoshopped.

CRITICAL REQUIREMENTS - MUST FOLLOW:

1. PERSON PRESERVATION (MOST IMPORTANT):
   - Use the EXACT same person from the first image - their face, body, skin tone, hair, all features
   - NEVER generate a different person or change their appearance
   - Keep their facial expression natural and friendly
   - This must look like the real person traveled to this location

2. POSE ADJUSTMENT (MEDIUM PRIORITY):
   - First, try to keep the person's original pose from the first image
   - However, if the original pose looks awkward, unnatural, or doesn't fit the location context, make SUBTLE adjustments:
     * Adjust to a simple, natural standing pose (relaxed, arms at sides or casually positioned)
     * Ensure the pose looks appropriate for the location (e.g., relaxed at beach, casual in city, composed at landmarks)
     * Keep body language natural and context-appropriate
   - IMPORTANT: Keep the same person's body proportions and features - only adjust the pose if absolutely needed
   - Do NOT make dramatic pose changes - keep it simple and natural
   - The person should look comfortable and natural in the scene, not stiff or awkward

3. COMPLETE THE OUTFIT INTELLIGENTLY:
   - Look at what the person is wearing in the first image
   - If they're wearing ONLY a top/shirt: Generate appropriate matching pants/jeans/trousers that complement the top. Choose neutral colors (black, blue, beige, gray, khaki) that work harmoniously with the shirt color. Consider the style - if it's a casual shirt, add jeans or chinos; if formal, add dress pants.
   - If they're wearing ONLY pants/bottoms: Generate an appropriate matching top/shirt that complements the bottoms. Choose colors and style that match the formality and color palette.
   - If they're already wearing a complete outfit: Keep it as is
   - The generated clothing should match the style, formality, and weather appropriateness of the location
   - IMPORTANT: Keep the main garment (the one they're actually wearing) EXACTLY as it appears - don't change its color or style
   - The generated complementary clothing should look natural, well-coordinated, and appropriate for the setting - not random or mismatched
   - Consider color harmony: if the main garment is bright, choose neutral complementary pieces; if it's neutral, you can add subtle color

4. NATURAL PLACEMENT IN SCENE:
   - ${positionInstruction}
   - ${scaleInstruction}
   - Make the person look like they BELONG in this location, not pasted on top
   - Ensure they're standing/positioned on the actual ground/surface of the location
   - Their feet should align with the perspective of the ground plane - no floating or sinking
   - Consider depth and perspective - if they're farther back, they should appear smaller and positioned correctly in 3D space
   - If the background has a visible horizon line, ensure the person's eye level aligns appropriately

5. REALISTIC LIGHTING INTEGRATION:
   - ${timeOfDayInstruction}
   - Match the lighting direction from the background (where is the sun/light source?)
   - Cast realistic shadows on the person that match the background's lighting angle and softness
   - Create realistic shadows FROM the person onto the ground/surfaces in the background - this is critical for realism
   - Adjust the person's skin tone and clothing colors to match the ambient light color temperature
   - Add appropriate highlights and shadows on the person's face and body matching the light direction
   - If it's bright sunlight, add stronger shadows; if overcast, soften all shadows
   - Ensure shadow length and direction match other objects in the scene

6. ATMOSPHERIC INTEGRATION:
   - ${weatherInstruction}
   - Add atmospheric haze/depth if the background has it (distant objects should be hazier)
   - Match color temperature (warm/cool tones) between person and background
   - If background is foggy/misty, apply same effect to the person proportionally based on their distance
   - Ensure color harmony between person and environment - they should share the same atmospheric color cast
   - If the location is dusty/sandy (desert, beach), add subtle environmental effects
   - Match air clarity and visibility between person and background

7. PERSPECTIVE AND SCALE:
   - Match the camera perspective and lens distortion of the background
   - Scale the person appropriately based on their distance from camera and relative to background elements
   - Ensure body proportions match the perspective rules of the scene
   - If background shows people or objects of known size, match the person's size relative to them
   - Account for wide-angle or telephoto lens effects visible in the background

8. EDGE BLENDING:
   - Seamlessly blend the person's edges into the background
   - No harsh cutout lines, halos, or glowing edges
   - Natural edge softness that matches the background's depth of field
   - Slight motion blur on edges if background shows it or if appropriate for scene
   - Hair edges should look particularly natural with individual strands visible where appropriate

9. VISUAL STYLE:
   - ${styleInstruction}
   - Ensure consistent image quality between person and background
   - Match grain, sharpness, and color characteristics exactly
   - Match saturation levels between person and environment
   - Ensure the same level of detail/sharpness for objects at the same distance
   - Make it impossible to tell this is a composite image - aim for seamless photographic realism

10. BACKGROUND REMOVAL:
    - Remove the ENTIRE original background from the first image
    - Do not leave any traces of the old background
    - Replace it COMPLETELY with the new background from the second image
    - Ensure clean separation between person and new background

11. CONTEXTUAL AWARENESS:
    - If the background is a beach, the person should look relaxed and vacation-ready
    - If it's a city street, they should look casual and urban-appropriate
    - If it's a landmark (Eiffel Tower, etc.), they should look like a tourist naturally visiting
    - Consider what a person would naturally be doing in this location
    - Add subtle environmental effects if appropriate (slight wind in hair if outdoor and windy, etc.)
    - Ensure the outfit and pose match the formality and context of the location

OUTPUT: A single photorealistic image where the exact person from the first image appears to be genuinely present in the location from the second image. They should have a complete, well-coordinated outfit, perfect lighting integration, realistic shadows both on them and cast by them, natural placement with correct perspective, and seamless atmospheric blending. The pose should be natural and appropriate for the setting. The final result should be indistinguishable from a real photograph taken at that location - no one should be able to tell this is AI-generated.`;

    console.log('🤖 Calling Gemini 2.5 Flash Image for fusion...');

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: userImageBase64
            }
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: backgroundImageBase64
            }
          },
          { text: prompt }
        ]
      }],
      generationConfig: {
        temperature: 0.3, // Slightly higher for creative background fusion
        topK: 40,
        topP: 0.95,
      }
    });

    const response = await result.response;
    const generatedImage = response.candidates[0].content.parts[0];

    if (!generatedImage || !generatedImage.inlineData) {
      throw new Error('No image generated by Gemini');
    }

    console.log('✅ Globetrotter fusion generated successfully');

    return NextResponse.json({
      success: true,
      imageData: generatedImage.inlineData.data,
    });

  } catch (error) {
    console.error('❌ Globetrotter Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate fusion' },
      { status: 500 }
    );
  }
}