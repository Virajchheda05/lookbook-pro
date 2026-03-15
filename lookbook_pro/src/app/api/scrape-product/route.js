import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const maxDuration = 60; // Use full 60 seconds

// ===== TIER 1: OPEN GRAPH EXTRACTION =====
async function extractOpenGraph(url) {
  try {
    console.log('🔍 Trying Open Graph extraction...');
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract Open Graph images
    const ogImages = [];
    const ogImageMatches = html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi);
    for (const match of ogImageMatches) {
      ogImages.push(match[1]);
    }

    // Extract other metadata
    const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const priceMatch = html.match(/<meta\s+property=["']product:price:amount["']\s+content=["']([^"']+)["']/i);
    const brandMatch = html.match(/<meta\s+property=["']og:brand["']\s+content=["']([^"']+)["']/i);

    if (ogImages.length > 0) {
      console.log(`✅ Open Graph found ${ogImages.length} images`);
      return {
        success: true,
        method: 'opengraph',
        images: ogImages,
        title: titleMatch?.[1] || '',
        price: priceMatch?.[1] || '',
        brand: brandMatch?.[1] || '',
      };
    }

    throw new Error('No Open Graph images found');
  } catch (error) {
    console.log('❌ Open Graph failed:', error.message);
    return { success: false };
  }
}

// ===== TIER 2: CHEERIO STATIC SCRAPING =====
async function extractWithCheerio(url) {
  try {
    console.log('🔍 Trying Cheerio extraction...');
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Site-specific selectors
    const selectors = {
      // Amazon
      amazon: [
        '#landingImage',
        '#imgTagWrapperId img',
        '.a-dynamic-image',
        '#altImages img'
      ],
      // Generic fallback
      generic: [
        'img[data-src*="product"]',
        'img[src*="product"]',
        'img[alt*="product"]',
        '.product-image',
        '.product-img',
        '#product-image'
      ]
    };

    const images = new Set();
    const hostname = new URL(url).hostname;

    // Try site-specific selectors first
    let selectorsToTry = selectors.generic;
    if (hostname.includes('amazon')) {
      selectorsToTry = [...selectors.amazon, ...selectors.generic];
    }

    // Extract images
    for (const selector of selectorsToTry) {
      $(selector).each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
        if (src && (src.startsWith('http') || src.startsWith('//'))) {
          const fullUrl = src.startsWith('//') ? `https:${src}` : src;
          // Filter out small icons/thumbnails
          if (!fullUrl.includes('icon') && !fullUrl.includes('logo') && !fullUrl.includes('sprite')) {
            images.add(fullUrl);
          }
        }
      });
    }

    // Extract metadata
    const title = $('h1').first().text().trim() || 
                  $('meta[property="og:title"]').attr('content') ||
                  $('title').text().trim();
    
    const price = $('[data-price]').first().attr('data-price') ||
                  $('.price').first().text().trim() ||
                  $('meta[property="product:price:amount"]').attr('content') ||
                  '';

    const brand = $('[data-brand]').first().attr('data-brand') ||
                  $('.brand').first().text().trim() ||
                  '';

    const imageArray = Array.from(images);

    if (imageArray.length > 0) {
      console.log(`✅ Cheerio found ${imageArray.length} images`);
      return {
        success: true,
        method: 'cheerio',
        images: imageArray,
        title,
        price,
        brand,
      };
    }

    throw new Error('No images found with Cheerio');
  } catch (error) {
    console.log('❌ Cheerio failed:', error.message);
    return { success: false };
  }
}

// ===== TIER 3: PUPPETEER DYNAMIC SCRAPING =====
async function extractWithPuppeteer(url) {
  let browser = null;
  
  try {
    console.log('🔍 Trying Puppeteer extraction...');
    
    // Launch browser
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('🌐 Navigating to URL...');
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('⏳ Waiting for content to load...');
    await page.waitForTimeout(3000);

    // Extract images and metadata
    const data = await page.evaluate(() => {
      const hostname = window.location.hostname;
      const images = new Set();

      // Site-specific extraction
      if (hostname.includes('myntra')) {
        // Myntra-specific selectors
        document.querySelectorAll('.image-grid-image, .image-grid-imageContainer img').forEach(img => {
          if (img.src && img.src.includes('http')) {
            images.add(img.src.replace(/\?.*$/, '')); // Remove query params
          }
        });
      } else if (hostname.includes('flipkart')) {
        // Flipkart-specific selectors
        document.querySelectorAll('._2r_T1I img, ._3kidJX img').forEach(img => {
          if (img.src && img.src.includes('http')) {
            images.add(img.src);
          }
        });
      } else if (hostname.includes('ajio')) {
        // AJIO-specific selectors
        document.querySelectorAll('.rilrtl-lazy-img, .prod-image-container img').forEach(img => {
          if (img.src && img.src.includes('http')) {
            images.add(img.src);
          }
        });
      } else if (hostname.includes('amazon')) {
        // Amazon-specific selectors
        document.querySelectorAll('#landingImage, .a-dynamic-image, #altImages img').forEach(img => {
          if (img.src && img.src.includes('http')) {
            images.add(img.src);
          }
        });
      } else {
        // Generic extraction - find all large images
        document.querySelectorAll('img').forEach(img => {
          if (img.src && 
              img.src.includes('http') && 
              img.naturalWidth > 200 && 
              img.naturalHeight > 200 &&
              !img.src.includes('logo') &&
              !img.src.includes('icon')) {
            images.add(img.src);
          }
        });
      }

      // Extract metadata
      const title = document.querySelector('h1')?.textContent?.trim() ||
                    document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                    document.title;

      const priceElement = document.querySelector('[data-price], .price, .pdp-price, ._30jeq3') ||
                          document.querySelector('meta[property="product:price:amount"]');
      const price = priceElement?.textContent?.trim() || 
                    priceElement?.getAttribute('content') || 
                    '';

      const brandElement = document.querySelector('[data-brand], .brand, .pdp-brand, ._2_R_DZ');
      const brand = brandElement?.textContent?.trim() || '';

      return {
        images: Array.from(images),
        title,
        price,
        brand,
      };
    });

    await browser.close();

    if (data.images.length > 0) {
      console.log(`✅ Puppeteer found ${data.images.length} images`);
      return {
        success: true,
        method: 'puppeteer',
        images: data.images,
        title: data.title,
        price: data.price,
        brand: data.brand,
      };
    }

    throw new Error('No images found with Puppeteer');
  } catch (error) {
    console.error('❌ Puppeteer error:', error);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ===== MAIN API HANDLER =====
export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let validUrl;
    try {
      validUrl = new URL(url);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`\n🚀 Starting scrape for: ${url}`);
    console.log(`📍 Hostname: ${validUrl.hostname}\n`);

    // TIER 1: Try Open Graph (fast)
    const ogResult = await extractOpenGraph(url);
    if (ogResult.success) {
      return NextResponse.json({
        ...ogResult,
        processingTime: '~1s',
      });
    }

    // TIER 2: Try Cheerio (medium speed)
    const cheerioResult = await extractWithCheerio(url);
    if (cheerioResult.success) {
      return NextResponse.json({
        ...cheerioResult,
        processingTime: '~2s',
      });
    }

    // TIER 3: Try Puppeteer (slow but reliable)
    const puppeteerResult = await extractWithPuppeteer(url);
    if (puppeteerResult.success) {
      return NextResponse.json({
        ...puppeteerResult,
        processingTime: '~10-15s',
      });
    }

    // All methods failed
    return NextResponse.json({
      success: false,
      error: 'Could not extract product images from this URL',
      suggestion: 'Please try uploading the image manually or paste a different product URL',
    }, { status: 422 });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}