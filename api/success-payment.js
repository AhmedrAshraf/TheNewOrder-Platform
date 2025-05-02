require('dotenv').config();
const express = require("express")
const cors = require("cors");
const stripe = require("stripe")('sk_test_51QyLTRQvrMo8HSYxuzAF1iM5SuCD9GSHYVI9LFDILs9bzWivlkZuqXhNVaW1mIybRvLPUjqGliJhqOLbpDbbmerl00lmuY2W95')

const app = express();
app.use(cors())
app.use(express.json()); 

app.get('/api/success-payment', async(req, res)=>{
    const {solution_id, totalprice, sellerId, messageId, solution, proposal} = req.query
    console.log("🚀 ~ app.get ~ req.body:", req.body)
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).send('Missing session_id');
    }

 try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("🚀 ~ app.post ~ session:", session.status)
    const uid = session.metadata.uid;

    let parsedSolution;

    if(solution){
    parsedSolution = JSON.parse(decodeURIComponent(solution));
    }

    let parsedProposal
    if(proposal){
    parsedProposal =  JSON.parse(decodeURIComponent(proposal))
    }

    // res.redirect(`http://localhost:5173/success?status=${session.status}&uid=${uid}&sessionId=${sessionId}&solutionId=${solution_id}&totalPrice=${totalprice}&sellerId=${sellerId}&messageId=${messageId}&solution=${encodeURIComponent(JSON.stringify(parsedSolution || {}))}&proposal=${encodeURIComponent(JSON.stringify(parsedProposal || {}))}`)
    res.redirect(`https://the-new-order-platform.vercel.app/success?status=${session.status}&uid=${uid}&sessionId=${sessionId}&solutionId=${solution_id}&totalPrice=${totalprice}&sellerId=${sellerId}&messageId=${messageId}&solution=${encodeURIComponent(JSON.stringify(parsedSolution || {}))}&proposal=${encodeURIComponent(JSON.stringify(parsedProposal || {}))}`);
} catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).send('Error processing payment');
  }
})

app.listen(8100, function () {
    console.log('listening on port 8100');
});