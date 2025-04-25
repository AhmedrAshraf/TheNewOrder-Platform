import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  ArrowRight,
  Download,
  MessageCircle,
  Rocket,
  FileArchive
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import axios from "axios"
import { useNotifications } from '../context/NotificationContext';

interface Solution {
  bluePrint?: string;
}

interface BookingDetail {
  solution?: Solution;
}

export function SuccessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [searchParams] = useSearchParams();

  const data = {
    status: searchParams.get("status"),
    uid: searchParams.get("uid"),
    sessionId: searchParams.get("sessionId"),
    amount: searchParams.get("totalPrice"),
    solution_id: searchParams.get("solutionId"),
    sellerId: searchParams.get("sellerId"),
    messageId: searchParams.get("messageId"),
  };

  const { addNotification } = useNotifications();

  const downloadBlueprint = async (url: string) => {
    try {
      const filename = url.split('/').pop() || 'blueprint';
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download blueprint');
    }
  };

  const sendEmail = async (emailData: { [key: string]: any }) => {
    const emailPayload = {
      ...emailData,
      amount: emailData.amount / 100
    };
    const response = await axios.post('https://the-new-order-platform-server.vercel.app/api/send-email', emailPayload);
    if (response.status === 200) {
      // alert("email send successfully")
    }
  }

  const updateBooking = async () => {
    setLoading(true);
    const rawSolution = searchParams.get("solution");
    let parsedSolution = null;

  if(rawSolution){
    try {
      parsedSolution = JSON.parse(decodeURIComponent(rawSolution));
      console.log("Parsed Solution: ", parsedSolution);
    } catch (err) {
      console.error("Error decoding solution:", err);
    }
  }
  
    try {
      const { data: existingBooking } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .eq("subscription_id", data.sessionId)
        .eq("solution_id", data.solution_id)
        .single();
   
      if (existingBooking) {
        setBookingDetail(existingBooking);
        if (existingBooking.solution?.bluePrint) {
          await downloadBlueprint(existingBooking.solution.bluePrint);
        }
        setLoading(false);
        return;
      }

      const messageId = data?.messageId !== "undefined" ? data.messageId : null;
      const amount = data.amount ? parseInt(data.amount) : 0;
      const solutionId = data.solution_id ? parseInt(data.solution_id) : 0;

      const { data: bookingData, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user?.id,
            subscription_id: data.sessionId,
            payment_status: data.status,
            amount: amount,
            status: "pending",
            solution_id: solutionId,
            sellerId: data.sellerId,
            message_id: messageId,
            solution: parsedSolution,
          },
        ])
        .select("*");
  
      if (error) {
        console.error("Error inserting orders:", error);
        return;
      }

      if (messageId) {
        const { data: messageRow, error } = await supabase
          .from("messages")
          .select("proposal")
          .eq("id", data.messageId)
          .single();
      
        if (!error && messageRow?.proposal) {
          messageRow.proposal.status = "paid";
          const { error: updateError } = await supabase
            .from("messages")
            .update({ proposal: messageRow.proposal })
            .eq("id", data.messageId);
      
          if (updateError) {
            console.error("Failed to update proposal status:", updateError);
          }
        } else {
          console.error("Failed to fetch proposal:", error);
        }
      }

      const emailData = { ...bookingData[0], email: user?.email };
      console.log("bookingData:", bookingData);
      await sendEmail(emailData);
      setBookingDetail(bookingData[0]);

      if (bookingData[0]?.solution?.bluePrint) {
        await downloadBlueprint(bookingData[0].solution.bluePrint);
      }

      // Send notification to admin after booking update
      addNotification({
        type: 'admin',
        title: 'Booking Updated',
        message: `Booking for user ${user?.email} has been updated successfully.`,
        link: '/admin/bookings'
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      console.log("User is not available yet.");
      return;
    }

    if (user?.id === data.uid && data.status === "complete" && data.sessionId) {
      console.log("User is found and payment is complete, updating booking...");
      updateBooking();
    } else {
      console.log("User ID doesn't match, or missing data.");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
        <button
          type="button"
          className="bg-gray-300 px-4 py-2 rounded flex items-center"
          disabled
        >
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="relative">
        {bookingDetail ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl p-8 border border-surface-200 shadow-card">
            <div className="text-center mb-8">
              <div className="bg-secondary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-secondary-500" />
              </div>
              <h1 className="text-3xl font-bold font-poppins mb-4 bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                Payment Successful!
              </h1>
              <p className="text-lg text-surface-600">
                Thank you for your purchase. You will receive an email confirmation shortly.
              </p>
            </div>
            
            <div className="bg-surface-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold font-poppins mb-4 flex items-center gap-2">
                <Rocket className="h-6 w-6 text-secondary-500" />
                <span>What's Next?</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-secondary-600 text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Check Your Email</p>
                    <p className="text-surface-600">Access instructions and documentation have been sent to your inbox</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-secondary-600 text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Visit Your Dashboard</p>
                    <p className="text-surface-600">Access your purchased tools and manage your automations</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-secondary-600 text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Get Support</p>
                    <p className="text-surface-600">Our team is here to help if you need any assistance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Access Your Purchase
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="px-6 py-3 bg-surface-100 hover:bg-surface-200 text-surface-900 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="h-5 w-5" />
                Back to Marketplace
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-surface-200">
              <div className="text-center">
                <p className="text-surface-600 mb-4">Need help getting started?</p>
                <button
                  onClick={() => navigate('/messages')}
                  className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-600"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat with Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
    ):(
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <div className="shadow p-5 rounded-2xl">
      <h1 className="text-2xl font-bold text-red-600">No payment found</h1>
      <p className="mt-2">Your transaction was not completed. Redirecting back...</p>
      </div>
    </div>
    )}
      </div>
    </div>
  );
}
