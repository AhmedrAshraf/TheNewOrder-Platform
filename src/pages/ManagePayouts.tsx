import React, { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
// import { Check, Clock, AlertCircle, ShoppingBag, Calendar,  Download, ArrowRight, RefreshCw, CreditCard, AlertTriangle} from 'lucide-react';
import { 
    Check, 
    Clock, 
    AlertCircle, 
    ShoppingBag, 
    Calendar, 
    Download, 
    ArrowRight,
    RefreshCw,
    CreditCard,
    AlertTriangle,
    Banknote,
    Edit,
    X
  } from 'lucide-react';
import { format } from 'date-fns';

function ManagePayouts() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPending, setTotalPending] = useState(0);
    const [showBankModal, setShowBankModal] = useState(null)
    const [bankDetails, setBankDetails] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        isPrimary: false
    });
    const [hasBankAccount, setHasBankAccount] = useState(false);


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

    // Removed duplicate fetchBankDetails function

    const fetchBankDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('seller_bank_details')
                .eq('id', user.id)
                .single();

            if (!error && data.seller_bank_details) {
                setBankDetails(data.seller_bank_details);
                setHasBankAccount(true);
            }
        } catch (err) {
            console.error("Error fetching bank details:", err);
        }
    };

    const saveBankDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ seller_bank_details: bankDetails })
                .eq('id', user?.id);

            if (error) {
                console.log("Error while saving account:", error);
                alert("Error while saving account");
                return;
            }

            setHasBankAccount(true);
            setShowBankModal(false);
        } catch (err) {
            console.log("Error:", err);
        }
    };

    const calculateTotalPending = (orders) => {
        const total = orders?.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0) || 0;
        setTotalPending(total);
    };

    useEffect(() => {
        if (user?.id) {
            fetchPendingPayouts();
            fetchBankDetails();
        }
    }, [user?.id]);

    const handleManageBankAccount = () => {
        if (hasBankAccount) {
            // Show view/edit modal with existing details
            setShowBankModal(true);
        } else {
            setBankDetails({
                accountName: '',
                accountNumber: '',
                bankName: '',
                ifscCode: '',
                isPrimary: false
            });
            setShowBankModal(true);
        }
    };

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



    // const saveBankDetails = async() =>{
    //     try{
    //         const {data, error } = await supabase
    //         .from('users')
    //         .update({"seller_bank_details": {...bankDetails}})
    //         .eq('id', user?.id)

    //         if(error){
    //             console.log("error while adding account");
    //             alert("error while adding account");
    //         }

    //         console.log(data);
    //     }catch(err){
    //         console.log("error", error);
    //     }

    //     console.log("added");
    //     setShowBankModal(false);
    // }

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
                        <button 
                            onClick={handleManageBankAccount}
                            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                            {hasBankAccount ? (
                                <Edit className="h-5 w-5" />
                            ) : (
                                <CreditCard className="h-5 w-5" />
                            )}
                            {hasBankAccount ? 'Edit Bank Account' : 'Add Bank Account'}
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
                                                src={order?.solution?.image || '/placeholder-product.jpg'}
                                                alt={order?.solution?.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {order?.solution?.status === "approved" && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-sm">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Order? Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                            <h3 className="text-lg font-semibold truncate">
                                                {order?.solution?.title || 'Solution #' + order?.solution_id}
                                            </h3>
                                            <p className="text-xl font-bold text-primary-600">
                                                ${parseFloat(order?.amount).toFixed(2)}
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
            {showBankModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {hasBankAccount ? 'Edit Bank Account' : 'Add Bank Account'}
                            </h3>
                            <button 
                                onClick={() => setShowBankModal(false)}
                                className="p-1 rounded-full hover:bg-surface-100"
                            >
                                <X className="h-5 w-5 text-surface-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">
                                    Account Holder Name
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.accountName}
                                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter account name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.bankName}
                                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter bank name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="1234567890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.ifscCode}
                                    onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                                    className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter IFSC Code"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={bankDetails.isPrimary}
                                    onChange={(e) => setBankDetails({...bankDetails, isPrimary: e.target.checked})}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-surface-700">
                                    Set as primary account for payouts
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setShowBankModal(false)}
                                    className="px-4 py-2 border border-surface-300 rounded-lg text-surface-700 hover:bg-surface-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveBankDetails}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm"
                                >
                                    {hasBankAccount ? 'Update Details' : 'Save Details'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ManagePayouts;