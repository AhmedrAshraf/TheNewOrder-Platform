require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/send-email", async (req, res) => {
  const order = req.body;
  console.log("Order ID:", order.id);
  console.log("🚀 Order Blueprint:", order?.solution?.bluePrint);

  const solution = order?.solution || {};
  const sellerName = solution.seller_name || "Marketplace Seller";
  const solutionTitle = solution.title || "Purchased Solution";
  const solutionDescription = solution.description || "Thank you for your purchase";

  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(order.amount / 100);

  const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    // host: "smtp.gmail.com",
    // port: 587,
    // secure: false,
    auth: {
      user: process.env.EMAIL_USER || "trustmuhammadimedical@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "fxjqiyaquedqyyjj",
    },
  });

  const mailOptions = {
    from: `Your Marketplace <${process.env.EMAIL_USER || "trustmuhammadimedical@gmail.com"}>`,
    to: order?.email,
    subject: `Order Confirmation #${order.id}`,
    html: getEmailHTML({
      order,
      solution,
      sellerName,
      solutionTitle,
      solutionDescription,
      orderDate,
      formattedPrice,
    }),
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ message: "Error sending email." });
  }
});

app.listen(8200, () => {
  console.log("Server running on http://localhost:8200");
});

/**
 * Generate HTML email template
 */
function getEmailHTML({ order, solution, sellerName, solutionTitle, solutionDescription, orderDate, formattedPrice }) {
  const blueprintSection = order?.solution?.bluePrint
    ? `
      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; margin-bottom: 20px; border-radius: 8px; max-width: 400px; margin: auto;">
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 12px;">
          <h4 style="font-weight: 500; font-size: 14px; color: #0369a1; display: flex; align-items: center; gap: 8px; margin: 0;">
            📄 Workflow Blueprint
          </h4>
          <span style="font-size: 12px; padding: 4px 8px; background-color: #e0f2fe; color: #0369a1; border-radius: 12px;">
            Download Available
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; padding: 12px; background-color: white; border: 1px solid #e0f2fe; border-radius: 8px;">
          <div style="background-color: #e0f2fe; padding: 12px; border-radius: 8px;">📘</div>
          <div style="flex: 1;">
            <p style="font-size: 12px; font-weight: 500; color: #1e3a8a; margin: 0 0 4px;">
              ${solution.bluePrint.split("/").pop() || "blueprint"}
            </p>
            <p style="font-size: 12px; color: #64748b; margin: 0;">
              Click below to download
            </p>
          </div>
       <a href="${order.solution.bluePrint}" 
        style="display: inline-block; padding: 8px 12px; background-color: #0369a1; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;"
        download="${order.solution.bluePrint.split('/').pop() || 'blueprint'}">
        Download
        </a>

        </div>
      </div>
    `
    : "";

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmation</title>
  </head>
  <body style="margin:0;padding:40px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f5f5f5;color:#333;">
    <table width="100%" style="margin:auto;background-color:#ffffff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
      <tr>
        <td style="background-color:#00d9c0;padding:30px 20px;text-align:center;">
          <h1 style="color:#ffffff;font-size:24px;margin:0;">Order Confirmation</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:30px 20px;text-align:center;background-color:#f0f9ff;">
          <h2 style="color:#00d9c0;font-size:22px;margin:0;font-weight:700;">Thank You for Your Purchase!</h2>
          <p style="color:#475569;font-size:16px;margin:10px 0 0;">Your order is confirmed and being processed.</p>
          <p style="font-size:16px;margin:5px 0 20px;">Order #${order.id} • ${orderDate}</p>
          <p style="font-size: 16px; margin: 5px 0 20px;">
            <a href="https://the-new-order-platform.vercel.app/order/${order.id}" style="color: #0369a1; text-decoration: none;">
              Go to your order history to download the blueprint: <span style="font-weight:700;">https://the-new-order-platform.vercel.app/order/${order.id}</span>
            </a>
          </p>

          ${blueprintSection}
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 20px;">
          <table width="100%" style="background:#f8fafc;border-radius:8px;padding:15px;">
            <tr>
              <td width="70%" style="padding-right:15px;vertical-align:top;">
                <h4 style="font-size:18px;color:#1e3a8a;margin:0 0 8px;">${solutionTitle}</h4>
                <p style="color:#64748b;font-size:14px;margin:0 0 8px;">${solutionDescription}</p>
                <p style="font-size:14px;margin:0;"><strong>Seller:</strong> ${sellerName}</p>
                <p style="font-size:14px;margin:8px 0 0;"><strong>Order ID:</strong> ${order.id}</p>
                <p style="font-size:14px;margin:8px 0 0;"><strong>Solution ID:</strong> ${order.solution_id}</p>
              </td>
              <td width="30%" style="text-align:right;vertical-align:top;">
                <p style="font-size:14px;margin:0 0 5px;color:#64748b;">Price</p>
                <p style="font-size:20px;font-weight:700;margin:0;color:#00d9c0;">${formattedPrice}</p>
                <p style="font-size:14px;margin:8px 0 0;color:#64748b;">Quantity: 1</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 20px;">
          <div style="background:#f0f9ff;border-radius:6px;padding:15px;">
            <h3 style="color:#00d9c0;font-size:16px;margin:0 0 10px;">How to Access Your Purchase</h3>
            <p style="font-size:14px;margin:0 0 10px;">
              1. Log in to your account dashboard<br/>
              2. Go to "My Purchases"<br/>
              3. Click "Access" on your solution
            </p>
            <div style="text-align:center;margin-top:15px;">
              <a href="https://the-new-order-platform.vercel.app/dashboard" style="padding:10px 20px;background:#00d9c0;color:white;text-decoration:none;border-radius:4px;font-weight:500;">Go to Dashboard</a>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="background-color:#00d9c0;padding:20px;text-align:center;color:white;">
          <p style="margin:0;font-size:14px;">Questions? Contact our support team</p>
          <p style="margin:5px 0 0;font-size:14px;">support@yourmarketplace.com | (555) 123-4567</p>
          <p style="margin:15px 0 0;font-size:12px;">© ${new Date().getFullYear()} Your Marketplace. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}