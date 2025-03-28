import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { productSchema, validateAndSanitizeInput, checkRateLimit, getSecurityHeaders } from '../../src/utils/security';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const handler: Handler = async (event) => {
  const headers = {
    ...getSecurityHeaders(),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Success' }),
      };
    }

    // Rate limiting
    const clientIp = event.headers['client-ip'] || event.headers['x-forwarded-for'];
    if (!checkRateLimit(clientIp || 'unknown')) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Too many requests' }),
      };
    }

    // Validate request method
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    // Validate and sanitize input
    const validation = validateAndSanitizeInput(productSchema, requestData);
    if (!validation.success) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: validation.error }),
      };
    }

    const { price, title, description } = requestData;

    // Create a product first
    const product = await stripe.products.create({
      name: title,
      description: description || title,
    });

    // Create a price for the product
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100), // Convert to cents and ensure it's an integer
      currency: 'usd',
    });

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:5173'}/marketplace`,
      metadata: {
        productId: product.id,
        productTitle: title,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_creation: 'always',
    });

    if (!session?.url) {
      throw new Error('Failed to create checkout session URL');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: session.url,
        sessionId: session.id,
      }),
    };
  } catch (error) {
    console.error('Checkout Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      }),
    };
  }
};