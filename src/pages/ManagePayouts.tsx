import React, { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Check, Clock, AlertCircle, ShoppingBag, Calendar,  Download, ArrowRight, RefreshCw, CreditCard, AlertTriangle} from 'lucide-react';
import { format } from 'date-fns';

function ManagePayouts() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPending, setTotalPending] = useState(0);

    const fetchPendingPayouts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!user?.id) return;
            
            const { data, error: supabaseError } = await supabase
                .from('orders')
                .select()
                .eq("sellerId", user.id)
                .eq("PaidFromAdmin", false)
                .order('created_at', { ascending: false });

            if (supabaseError) throw supabaseError;

            setOrders(data || []);
            calculateTotalPending(data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalPending = (orders) => {
        const total = orders?.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0) || 0;
        setTotalPending(total);
    };

    useEffect(() => {
        if (user?.id) {
            fetchPendingPayouts();
        }
    }, [user?.id]);

    if (!user) {
        return <div className="p-6 text-center text-surface-600">Please log in to view payouts</div>;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto p-6 bg-red-50 rounded-xl border border-red-100 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load payouts</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                    onClick={fetchPendingPayouts}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </button>
            </div>
        );
    }

    return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-white relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-surface-900">Payout Management</h1>
                    <p className="text-surface-500 mt-1">
                        {format(new Date(), 'MMMM d, yyyy')} • {orders.length} pending {orders.length === 1 ? 'payment' : 'payments'}
                    </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-surface-200">
                    <div className="flex items-center gap-10 justify-between">
                        <div>
                            <p className="text-sm font-medium text-surface-500">Pending Balance</p>
                            <p className="text-2xl font-bold text-surface-900">
                                ${totalPending.toFixed(2)}
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Manage my bank account
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order?.id}
                            className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="p-5">
                                <div className="flex flex-col sm:flex-row gap-5">
                                    {/* Solution Image */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-100">
                                            <img
                                                src={order.solution?.image || '/placeholder-product.jpg'}
                                                alt={order.solution?.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {order.solution?.status === "approved" && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-sm">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                            <h3 className="text-lg font-semibold truncate">
                                                {order.solution?.title || 'Solution #' + order.solution_id}
                                            </h3>
                                            <p className="text-xl font-bold text-primary-600">
                                                ${parseFloat(order.amount).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-surface-600">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1.5 text-surface-400" />
                                                <span>
                                                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <ShoppingBag className="h-4 w-4 mr-1.5 text-surface-400" />
                                                <span>Order #{order.id}</span>
                                            </div>
                                            <div className="flex items-center">
                                                {order.status === 'pending' ? (
                                                    <Clock className="h-4 w-4 mr-1.5 text-yellow-500" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 mr-1.5 text-red-500" />
                                                )}
                                                <span className="capitalize">{order.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-surface-50 px-5 py-3 border-t border-surface-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                        order.PaidFromAdmin 
                                            ? "bg-green-100 text-green-800" 
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                        {order.PaidFromAdmin ? 'Payment Completed' : 'Awaiting Admin Payment'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-surface-50 rounded-xl p-12 text-center border-2 border-dashed border-surface-200">
                    <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-5">
                        <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium text-surface-800 mb-2">All caught up!</h3>
                    <p className="text-surface-500 max-w-md mx-auto">
                        You don't have any pending payouts. All your earnings have been processed.
                    </p>
                </div>
            )}
        </div>
    );
}

export default ManagePayouts;