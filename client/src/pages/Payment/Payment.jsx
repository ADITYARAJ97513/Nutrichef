import React, { useState } from 'react';
import { Crown, Check, CreditCard, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const Payment = () => {
  // --- 1. GET the correct 'refreshUser' function from the context ---
  const { user, refreshUser } = useAuth(); 
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const plans = {
    monthly: { name: 'Monthly Pro', price: 9.99, period: 'month', savings: null },
    yearly: { name: 'Yearly Pro', price: 99, period: 'year', savings: '17% off' },
  };

  const features = [
    'AI-powered meal planning',
    'Personalized recipe generation',
    'Advanced analytics & reports',
    'PDF meal plan exports',
    'Recipe catalog from other pro users',
    'Priority customer support',
    'Unlimited recipe generation',
    'Custom dietary preferences',
  ];

  const handlePayment = async () => {
    setLoading(true);

    const scriptLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!scriptLoaded) {
      toast.error('Could not load payment gateway. Please check your connection.');
      setLoading(false);
      return;
    }

    try {
      const orderResponse = await axios.post('/api/payments/create-order', {
        plan: selectedPlan,
      });

      const { amount, orderId, currency, keyId } = orderResponse.data;
      
      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: currency,
        name: 'NutriChef Pro',
        description: `Subscription - ${plans[selectedPlan].name}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verificationResponse = await axios.post('/api/payments/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan,
            });

            toast.success(verificationResponse.data.message);
            
            // --- 2. THIS IS THE FIX ---
            // Refresh the user's data globally to update their role to 'pro_user'
            await refreshUser(); 

            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);

          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name, 
          email: user.email,
        },
        theme: {
          color: '#4f46e5', 
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      // Razorpay's modal handles the loading state, so we ensure it's false when the modal closes or fails
      paymentObject.on('payment.failed', function (response) {
        setLoading(false);
      });
      // The main button can be re-enabled once the modal is closed
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const isPro = user?.role === 'pro_user' || user?.role === 'admin';

  if (isPro) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            You're Already a Pro Member!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Enjoy all the premium features of NutriChef Pro.
          </p>
          {user?.subscription && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Current Subscription</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium capitalize">{user.subscription.plan} Pro</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600 capitalize">{user.subscription.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="font-medium">
                    {new Date(user.subscription.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="mt-8">
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="bg-accent-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Crown className="h-10 w-10 text-accent-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Upgrade to NutriChef Pro
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock powerful AI features and take your cooking to the next level
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Pro Features</h3>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="bg-gray-100 rounded-lg p-1 flex mb-6">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`w-1/2 py-2 rounded-md font-medium transition-colors ${
                selectedPlan === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`w-1/2 py-2 rounded-md font-medium transition-colors flex items-center justify-center ${
                selectedPlan === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              {plans.yearly.savings && (
                <span className="ml-2 bg-accent-100 text-accent-800 text-xs px-2 py-1 rounded-full">
                  {plans.yearly.savings}
                </span>
              )}
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              ₹{plans[selectedPlan].price}
            </div>
            <div className="text-gray-600">
              per {plans[selectedPlan].period}
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-accent-600 hover:bg-accent-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>Subscribe to Pro</span>
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 mt-4">
              Cancel anytime. No hidden fees.
            </p>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <span>Payments processed securely by Razorpay.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
