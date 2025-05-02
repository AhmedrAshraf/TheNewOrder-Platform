require('dotenv').config();
const express = require("express")
const cors = require("cors")
const stripe = require("stripe")('sk_test_51QyLTRQvrMo8HSYxuzAF1iM5SuCD9GSHYVI9LFDILs9bzWivlkZuqXhNVaW1mIybRvLPUjqGliJhqOLbpDbbmerl00lmuY2W95')

const app = express();
app.use(cors())
app.use(express.json()); 

app.post('/api/create-checkout-session', async(req, res)=>{
    const {uid, customerEmail, totalprice, solution_id ,sellerId, messageId, solution, proposal} = req.body
    console.log(req.body);

    if (!totalprice || !uid || !customerEmail || !solution_id || !sellerId) {
      console.log("Invalid fields");
      return
    }
    try{
    const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Booking Payment',
                },
                unit_amount: totalprice * 100, 
              },
            quantity: 1,
          },
        ],
        mode: 'payment',
        // success_url: `http://localhost:8100/api/success-payment?session_id={CHECKOUT_SESSION_ID}&solution_id=${solution_id}&totalprice=${totalprice}&sellerId=${sellerId}&messageId=${messageId}&solution=${encodeURIComponent(JSON.stringify(solution || {}))}&proposal=${encodeURIComponent(JSON.stringify(proposal || {}))}`,
        // success_url: `https://the-new-order-platform-server.vercel.app/api/success-payment?session_id={CHECKOUT_SESSION_ID}&solution_id=${solution_id}&totalprice=${totalprice}&sellerId=${sellerId}&messageId=${messageId}&solution=${encodeURIComponent(JSON.stringify(solution || {}))}&proposal=${encodeURIComponent(JSON.stringify(proposal || {}))}`,
        success_url: `https://the-new-order-platform-server.vercel.app/api/success-payment?session_id={CHECKOUT_SESSION_ID}&solution_id=${solution_id}&totalprice=${totalprice}&sellerId=${sellerId}&messageId=${messageId}&solution=${encodeURIComponent(JSON.stringify(solution || {}))}&proposal=${encodeURIComponent(JSON.stringify(proposal || {}))}`,
        cancel_url: 'https://the-new-order-platform.vercel.app/cancel',

        customer_email: `${customerEmail}`,
        metadata: {uid: uid},
      });
      console.log("🚀 ~ app.post ~ session:", session)
      res.json({session})
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(500).send('Error processing payment');
    }
});

app.listen(8000, function () {
    console.log('listening on port 8000');
});