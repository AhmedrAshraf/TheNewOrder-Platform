import { useState, useEffect , useRef} from 'react';
import { Search,  ChevronLeft, Send, MessageCircle, CreditCard, Loader2, ArrowDownToLine, CheckCircle } from 'lucide-react';
import type { ChatMessage } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState(null)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingProposals, setLoadingProposals] = useState<Record<string, boolean>>({});
  const [proposal, setProposal] = useState([]);
  const [chatId, setChatId] = useState(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const {user} = useAuth()
  const messagesEndRef = useRef(null);
  const currentUserId = user?.id
  const messageContainerRef = useRef(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && messageContainerRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
  
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchChats = async () => {
      const { data: fetchChat, error: fetchError } = await supabase
        .from('chats') 
        .select()
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
  
      if (fetchError) {
        console.error('Error fetching chats:', fetchError);
      } else {
        // Check unread messages count
        const updatedChats = await Promise.all(
          fetchChat.map(async (chat) => {
            const { data: unreadMessages } = await supabase
              .from('messages')
              .select('id')
              .eq('chat_id', chat.id)
              .eq('is_read', false);
  
            return {
              ...chat,
              unreadCount: unreadMessages?.length || 0,
            };
          })
        );
        setChats(updatedChats);
      }
    };
  
    fetchChats();
  }, [user?.id]);
  

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
  
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', selectedChat)
        .eq('is_read', false);
  
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', selectedChat)
        .order('created_at', { ascending: true }); 
  
      if (messagesError) {
        console.error('Error while fetching messages:', messagesError);
      } else {
        setMessages(messagesData || []);
      }
    };
  
    fetchMessages();
  }, [selectedChat]);

  

  const getChatParticipantName = (chat: any) => {
    if (chat.buyer_id === currentUserId) {
      return chat.seller_name;
    } else if (chat.seller_id === currentUserId) {
      return chat.buyer_name;
    }
    return 'Unknown'; 
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
  
    try {
      const currentChat = chats?.find(c => c.id === selectedChat);
      const userType = currentChat?.seller_id === user.id ? 'seller' : 'buyer';
  
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: selectedChat,
            sender_id: user.id,
            message: newMessage,
            is_read: false,
            type: userType,
          },
        ])
        .select()
        .maybeSingle();
  
      if (messagesError) {
        console.error("Error while inserting message:", messagesError);
        return;
      }
  
      console.log("Message inserted", messagesData);
      setMessages(prev => [...prev, messagesData]);
      setNewMessage('');

      if (messagesEndRef.current && messageContainerRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    } catch (error) {
      console.error("Error while inserting message:", error);
    }
  };

  const handleSendProposal = async () => {
    setIsSubmitting(true);
  
    try {
      const totalCost = proposal.hours * proposal.rate;

      const { data: proposalData, error: proposalError } = await supabase
        .from('messages')
        .insert([{
          chat_id: selectedChat,
          sender_id: user?.id,
          is_read: false,
          type: 'proposal',
          proposal: {
            title: proposal?.title,
            description: proposal?.description,
            hours: proposal?.hours,
            rate: proposal?.rate,
            total_cost: totalCost,
            status: 'pending'
          }
        }])
        .select()
        .single();
  
      if (proposalError) throw proposalError;
  
      setMessages(prev => [...prev, proposalData]);
      setShowProposalForm(false);
      setProposal({ hours: 1, rate: 150, description: '', title: '' });

      if (messagesEndRef.current && messageContainerRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
  
    } catch (error) {
      console.error('Error sending proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawProposal = async (messageId: string) => {
    try {
      setLoadingProposals(prev => ({ ...prev, [messageId]: true }));
  
      const { error } = await supabase
        .from('messages')
        .update({
          proposal: {
            ...messages.find(m => m.id === messageId)?.proposal,
            status: 'withdrawn',
          },
        })
        .eq('id', messageId);
  
      if (error) throw error;
  
      // Optional: update local messages state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? { ...msg, proposal: { ...msg.proposal, status: 'withdrawn' } }
            : msg
        )
      );
    } catch (error) {
      console.error('Error withdrawing proposal:', error);
    } finally {
      setLoadingProposals(prev => ({ ...prev, [messageId]: false }));
    }
  };
  const handlePayment = async (message: any) => {
    if (!user) {
      alert("Please login to continue");
      return;
    }
  
    try {
      setLoadingProposals(prev => ({ ...prev, [message.id]: true }));

      const response = await axios.post(
        'https://the-new-order-platform-server.vercel.app/api/create-checkout-session',
        {
          uid: user?.id,
          totalprice: message.proposal?.total_cost,
          customerEmail: user?.email,
          sellerId: message.sender_id,
          messageId: message.id,
          proposal: {
            title: message.proposal?.title,
            description: message.proposal?.description,
            hours: message.proposal?.hours,
            rate: message.proposal?.rate,
            total_cost: message.proposal?.total_cost,
            status: message.proposal?.status,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (response.status === 200) {
        const { session } = response.data;
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Error during payment:', error);
    } finally {
      setLoadingProposals(prev => ({ ...prev, [message.id]: false }));
    }
  };

  return (
    <div className="pt-16 bg-surface-50">
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-surface-200 bg-white">
          <div className="p-4 border-b border-surface-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-secondary-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Search onClick={handleSendMessage} className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-8rem)]">
            {chats?.map((chat) => (
              <button
                key={chat?.id}
                onClick={() => setSelectedChat(chat?.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-surface-50 transition-colors ${
                  selectedChat === chat?.id ? 'bg-surface-50' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={chat?.avatar || 'https://static-00.iconduck.com/assets.00/user-avatar-1-icon-2048x2048-935gruik.png'}
                    alt="user avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat?.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-500 text-white text-xs rounded-full flex items-center justify-center">
                      {chat?.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{getChatParticipantName(chat)}</h3>
                    <span className="text-xs text-surface-400">
                      {new Date(chat?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-surface-500 truncate">{chat?.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-surface-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 hover:bg-surface-100 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <img
                  src={chats.find(c => c.id === selectedChat)?.avatar || "https://static-00.iconduck.com/assets.00/user-avatar-1-icon-2048x2048-935gruik.png"}
                  alt="Chat Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium truncate">{getChatParticipantName(chats.find(c => c.id === selectedChat))}</h4>
                </div>
              </div>
              {/* <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-surface-100 rounded-full">
                  <Phone className="h-5 w-5 text-surface-600" />
                </button>
                <button className="p-2 hover:bg-surface-100 rounded-full">
                  <Video className="h-5 w-5 text-surface-600" />
                </button>
                <button className="p-2 hover:bg-surface-100 rounded-full">
                  <MoreVertical className="h-5 w-5 text-surface-600" />
                </button>
              </div> */}
            </div>

            {/* Messages */}
            <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === 'proposal' ? (
                    <div
                      className={`space-y-2 w-3/4 ${
                        message.sender_id === user.id ? 'justify-self-end' : 'justify-self-start'
                      }`}
                    >
                      <div className="bg-white rounded-xl p-4 border border-surface-200">
                        <h4 className="font-medium mb-2">{message.proposal?.title}</h4>
                        <p className="text-sm mb-2">{message.proposal?.description}</p>
                        <div className="flex justify-between text-sm">
                          <span>Hours: {message.proposal?.hours}</span>
                          <span>Rate: ${message.proposal?.rate}/hr</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-surface-200 flex justify-between items-center">
                          <span className="font-bold">${message.proposal?.total_cost}</span>

                          {message.proposal?.status === 'pending' && (
                            <button
                              onClick={() =>
                                message.sender_id === user.id
                                  ? handleWithdrawProposal(message.id)
                                  : handlePayment(message)
                              }
                              disabled={loadingProposals[message.id]}
                              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-300 text-white rounded-lg text-sm flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              {loadingProposals[message.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : message.sender_id === user.id ? (
                                <>
                                  <ArrowDownToLine className="h-4 w-4" />
                                  Withdraw Offer
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-4 w-4" />
                                  Pay Now
                                </>
                              )}
                            </button>
                          )}

                          {message.proposal?.status === 'paid' && (
                            <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-lg text-sm flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Paid
                            </span>
                          )}

                          {message.proposal?.status === 'withdrawn' && (
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 rounded-lg text-sm flex items-center gap-1">
                              <ArrowDownToLine className="h-4 w-4" />
                              Offer Withdrawn
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs opacity-70 text-right mt-1">
                        {new Date(message.created_at).toLocaleString([], {
                          day: 'numeric',
                          month: 'short',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 ${
                          message.sender_id === user?.id ? 'bg-secondary-500 text-white' : 'bg-surface-100'
                        }`}
                      >
                        <p>{message.message}</p>
                        <p className="text-xs opacity-70 text-right mt-1">
                          {new Date(message.created_at).toLocaleString([], {
                            day: 'numeric',
                            month: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-surface-200">
              <div className="flex items-center gap-2">
                {(chats.find(c => c.seller_id === user.id) &&
                <button
                className="p-3 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-xl text-md flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                onClick={() => setShowProposalForm(true)}>
                  {/* <Paperclip className="h-5 w-5 text-surface-600" /> */}
                  Send Proposal
                </button>
                )}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-surface-50 border border-surface-200 rounded-full py-2 px-4 focus:outline-none focus:border-secondary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                {/* <button className="p-2 hover:bg-surface-100 rounded-full">
                  <Smile className="h-5 w-5 text-surface-600" />
                </button> */}
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-surface-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-surface-400 mx-auto mb-4" />
              <p className="text-surface-600">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showProposalForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <h4 className="font-medium text-xl mb-4">Send Proposal</h4>
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Proposal Title</label>
                <input
                  value={proposal.title}
                  onChange={(e) => setProposal(prev => ({ ...prev, title: e.target.value || '' }))}
                  className="w-full bg-white border border-surface-200 rounded-lg py-2 px-3 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  placeholder="Describe what you're making proposal for..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hours</label>
                  <input
                    type="number"
                    min="1"
                    placeholder='Hours'
                    value={proposal.hours}
                    onChange={(e) => setProposal(prev => ({ ...prev, hours: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-white border border-surface-200 rounded-lg py-2 px-3 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rate ($/hr)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder='Rate'
                    value={proposal.rate}
                    onChange={(e) => setProposal(prev => ({ ...prev, rate: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white border border-surface-200 rounded-lg py-2 px-3 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={proposal.description}
                  onChange={(e) => setProposal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white border border-surface-200 rounded-lg py-2 px-3 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 h-32"
                  placeholder="Describe what you'll deliver..."
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-surface-200">
                <p className="font-medium text-lg">Total: ${proposal.hours * proposal.rate}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowProposalForm(false)}
                    className="px-4 py-2 bg-surface-200 hover:bg-surface-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendProposal}
                    disabled={isSubmitting || !proposal.description}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Send Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}