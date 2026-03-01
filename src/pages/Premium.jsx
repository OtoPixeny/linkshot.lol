import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Star, Zap, Shield, Palette, Globe, BarChart, Users, Wallet, Plus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { NoiseBackground } from '@/components/ui/noise-background';
import { InputOtp } from '@heroui/react';
import { getUserBalance, handleBalanceTopUp, handlePremiumPurchase, createSupabaseUser, getUserByClerkId } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import './Premium.css';

// Orbit Icon Component
const OrbitIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 512 512" fill="currentColor">
    <path d="M256,93.091c-19.396,0-37.994,3.396-55.246,9.615c12.645,10.1,21.718,24.486,24.984,40.946
      c9.657-2.603,19.796-4.015,30.262-4.015c64.163,0,116.364,52.201,116.364,116.364S320.163,372.364,256,372.364
      S139.636,320.163,139.636,256c0-10.466,1.412-20.606,4.015-30.262c-16.46-3.266-30.846-12.339-40.946-24.984
      c-6.219,17.253-9.615,35.852-9.615,55.246c0,89.972,72.937,162.909,162.909,162.909S418.909,345.972,418.909,256
      S345.972,93.091,256,93.091z"/>
    <circle cx="157.262" cy="157.262" r="23.273"/>
    <path d="M256,0C114.842,0,0,114.842,0,256c0,45.776,12.088,88.776,33.223,125.997c2.526-3.806,5.461-7.419,8.814-10.771
      c8.187-8.186,18.05-14.085,28.815-17.385C55.346,324.619,46.545,291.32,46.545,256c0-56.173,22.232-107.248,58.354-144.901
      c2.023-2.109,4.09-4.175,6.198-6.198C148.75,68.779,199.826,46.545,256,46.545c115.493,0,209.455,93.961,209.455,209.455
      S371.493,465.455,256,465.455c-35.339,0-68.655-8.81-97.887-24.329c-3.23,10.56-9.002,20.502-17.338,28.84
      c-3.325,3.325-6.929,6.271-10.755,8.822C167.236,499.915,210.232,512,256,512c141.158,0,256-114.842,256-256S397.158,0,256,0z"/>
    <path d="M107.861,404.139c-4.544-4.544-10.501-6.817-16.457-6.817c-5.956,0-11.913,2.271-16.457,6.817
      c-9.089,9.089-9.089,23.824,0,32.912c4.544,4.544,10.501,6.817,16.457,6.817c5.956,0,11.913-2.273,16.457-6.817
      C116.95,427.962,116.95,413.227,107.861,404.139z"/>
    <path d="M256,186.182c-38.56,0-69.818,31.26-69.818,69.818c0,38.558,31.258,69.818,69.818,69.818
      c38.561,0,69.818-31.26,69.818-69.818C325.818,217.442,294.561,186.182,256,186.182z M256,279.273
      c-12.833,0-23.273-10.44-23.273-23.273s10.44-23.273,23.273-23.273s23.273,10.44,23.273,23.273S268.833,279.273,256,279.273z"/>
  </svg>
);

const PremiumPage = () => {
  const { resolvedTheme } = useTheme();
  const { user } = useUser();
  const [paymentProcessing, setPaymentProcessing] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Load user balance from Supabase
  useEffect(() => {
    const loadBalance = async () => {
      if (user?.id) {
        try {
          console.log('Loading balance for Clerk ID:', user.id);
          
          // First try to get user by Clerk ID
          let userData = await getUserByClerkId(user.id);
          
          if (!userData) {
            // If user doesn't exist in Supabase, create them
            console.log('User not found in Supabase, creating...');
            userData = await createSupabaseUser(user);
          }
          
          if (userData) {
            console.log('User data:', userData);
            setUserBalance(userData.balance || 0);
          }
        } catch (error) {
          console.error('Error loading balance:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadBalance();
  }, [user]);
  
  // Convert GEL to USD (approximate rate: 1 GEL = 0.37 USD)
  const convertGELToUSD = (gelAmount) => {
    return (gelAmount * 0.37).toFixed(2);
  };
  
  // Check if user has sufficient balance
  const hasSufficientBalance = (priceGEL) => {
    return userBalance >= priceGEL;
  };
  
  // Handle top-up with PayPal
  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) < 5) {
      alert('მინიმალური შევსების თანხაა 5₾');
      return;
    }
    
    if (!user?.id) {
      alert('გთხოვთ დალოგინოთ სისტემაში');
      return;
    }
    
    const usdAmount = convertGELToUSD(parseFloat(topUpAmount));
    const businessEmail = 'sb-dhi7v49097636@business.example.com';
    const itemName = `Balance Top-up - ${topUpAmount}₾`;
    const return_url = `${window.location.origin}/premium/topup-success?amount=${topUpAmount}`;
    const cancel_url = `${window.location.origin}/premium`;
    
    const paypalUrl = `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(businessEmail)}&item_name=${encodeURIComponent(itemName)}&amount=${usdAmount}&currency_code=USD&no_shipping=1&no_note=1&return=${encodeURIComponent(return_url)}&cancel_return=${encodeURIComponent(cancel_url)}`;
    
    window.open(paypalUrl, '_blank', 'width=800,height=600');
    setShowTopUpModal(false);
    setTopUpAmount("");
    
    // Simulate successful top-up (in real app, this would be handled by webhook)
    setTimeout(async () => {
      try {
        // Get user data first to get correct Supabase ID
        const userData = await getUserByClerkId(user.id);
        if (userData) {
          const result = await handleBalanceTopUp(userData.id, parseFloat(topUpAmount));
          if (result.success) {
            setUserBalance(result.newBalance);
            alert('ბალანსი წარმატებით შეივსო!');
          }
        }
      } catch (error) {
        console.error('Top-up error:', error);
      }
    }, 3000);
  };
  
  // Handle premium purchase with balance
  const handleBalancePurchase = async (plan, priceGEL) => {
    if (!hasSufficientBalance(priceGEL)) {
      alert(`არასაკმარისი ბალანსი! საჭიროა ${priceGEL}₾, ხოლო თქვენ გაქვთ ${userBalance}₾`);
      return;
    }
    
    if (!user?.id) {
      alert('გთხოვთ დალოგინოთ სისტემაში');
      return;
    }
    
    setPaymentProcessing(plan);
    
    try {
      // Get user data first to get correct Supabase ID
      const userData = await getUserByClerkId(user.id);
      if (!userData) {
        throw new Error('User not found in database');
      }
      
      const result = await handlePremiumPurchase(userData.id, plan, priceGEL);
      if (result.success) {
        setUserBalance(result.newBalance);
        alert(`წარმატებით შეიძინეთ ${plan} პლანი!`);
      } else {
        alert(`შეცდომა: ${result.error || 'უცნობი შეცდომა'}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('შეცდომა განხორციელდა. სცადეთ თავიდან.');
    } finally {
      setPaymentProcessing(null);
    }
  };
  
  const handlePayPalPayment = (plan, priceGEL) => {
    setPaymentProcessing(plan);
    
    const usdAmount = convertGELToUSD(priceGEL);
    const businessEmail = 'sb-dhi7v49097636@business.example.com'; // Your sandbox business email
    const itemName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - LinkShot Premium`;
    const return_url = `${window.location.origin}/premium/success`;
    const cancel_url = `${window.location.origin}/premium/cancel`;
    
    // Create PayPal payment URL
    const paypalUrl = `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(businessEmail)}&item_name=${encodeURIComponent(itemName)}&amount=${usdAmount}&currency_code=USD&no_shipping=1&no_note=1&return=${encodeURIComponent(return_url)}&cancel_return=${encodeURIComponent(cancel_url)}`;
    
    // Open PayPal in new window
    const paymentWindow = window.open(paypalUrl, '_blank', 'width=800,height=600');
    
    if (paymentWindow) {
      // Check if payment window was closed
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          setPaymentProcessing(null);
        }
      }, 1000);
    } else {
      // Fallback: redirect directly
      window.location.href = paypalUrl;
    }
  };
  
  const showPaymentFallback = (plan, price) => {
    const contactInfo = `
გადადებინება ავტომატური გადასახურებით!

გთხილვწიეთ შემდეგი დაგეგმით:
• პლანი: ${plan.charAt(0).toUpperCase() + plan.slice(1)}
• ფასი: ₾${price}
• ვალუტა: GEL

გადასახურების ვარიანტები:
📧 Email: linkshot@support.com
💳 ბმული: +995 555 123 456
🌐 ვებსაიტი: www.linkshot.ge

გთავიწყვენთ გადახმარებას!
    `;
    
    alert(contactInfo);
    setPaymentProcessing(null);
  };
  
  return (
    <div className={`min-h-screen py-12 px-4 ${resolvedTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-5xl font-bold mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            გახდი <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">პრემიუმ</span> მომხმარებელი
          </h1>
          <p className={`text-xl max-w-2xl mx-auto ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            განავითარეთ თქვენი ბრენდი პრემიუმ ფუნქციებით და გამორჩეული შესაძლებლობებით
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Free Plan */}
          <div className={`flex flex-col ${resolvedTheme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} rounded-3xl border`}>
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="grid items-center justify-center w-full grid-cols-1 text-left">
                <div>
                  <h2 className={`text-lg font-medium tracking-tighter ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} lg:text-3xl`}>
                    სილვერი
                  </h2>
                  <p className={`mt-2 text-sm ${resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>დაიწყეთ უფასოდ</p>
                </div>
                <div className="mt-6">
                  <p>
                    <span className={`text-5xl font-light tracking-tight ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
                      <OrbitIcon className="w-12 h-12 inline mr-2" />0
                    </span>
                    <span className={`text-base font-medium ${resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}> /თვე </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex px-6 pb-8 sm:px-8">
              {paymentProcessing === 'free' ? (
                <div className="flex items-center justify-center w-full px-6 py-2.5 text-center text-gray-500 bg-gray-100 border-2 border-gray-300 rounded-full text-sm">
                  Processing...
                </div>
              ) : (
                <NoiseBackground
                    containerClassName="full-with full_withput noise-bg-full p-2 rounded-full mx-auto"
                    gradientColors={["rgba(114, 114, 114, 1)", "rgba(114, 114, 114, 1)", "rgba(196, 196, 196, 1)"]}>
                    <button
                      onClick={() => handlePayPalPayment('enterprise', 299)}
                      className="full-with full_withput full_with h-full w-full cursor-pointer rounded-full bg-gradient-to-r from-neutral-100 via-neutral-100 to-white px-8 py-3 text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-95 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]">
                      <span className="full_withput flex items-center justify-center w-full">       
                        ამჟამინდელი
                      </span>
                    </button>
                  </NoiseBackground>
              )}
            </div>
          </div>

          {/* Professional Plan */}
          <div className={`flex flex-col ${resolvedTheme === 'dark' ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} rounded-3xl border-2 relative overflow-hidden`}>
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold">გაყიდვადი</span>
            </div>
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="grid items-center justify-center w-full grid-cols-1 text-left">
                <div>
                  <h2 className={`text-lg font-medium tracking-tighter ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-600'} lg:text-3xl`}>
                    ელიტი
                  </h2>
                  <p className={`mt-2 text-sm ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>საშუალო დონის პაკი</p>
                </div>
                <div className="mt-6">
                  <p>
                    <span className={`text-5xl font-light tracking-tight ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
                      <OrbitIcon className="w-12 h-12 inline mr-2" />15
                    </span>
                    <span className={`text-base font-medium ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}> /თვე </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex px-6 pb-8 sm:px-8">
              {paymentProcessing === 'professional' ? (
                <div className="flex justify-center">
                  <NoiseBackground
                    containerClassName="noise-bg-full p-2 rounded-full mx-auto"
                    gradientColors={["rgb(168, 85, 247)", "rgb(236, 72, 153)", "rgb(251, 146, 60)"]}>
                    <div className="px-8 py-3 text-gray-500 rounded-full bg-white">
                      Processing...
                    </div>
                  </NoiseBackground>
                </div>
              ) : (
                  <NoiseBackground
                    containerClassName="full-with noise-bg-full p-2 rounded-full mx-auto"
                    gradientColors={["rgb(168, 85, 247)", "rgb(236, 72, 153)", "rgb(251, 146, 60)"]}>
                    <button
                      onClick={() => handleBalancePurchase('professional', 15)}
                      className="full-with full_with h-full w-full cursor-pointer rounded-full bg-gradient-to-r from-neutral-100 via-neutral-100 to-white px-8 py-3 text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-95 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]">
                      <span className="flex items-center justify-center w-full">
                        გადახდა
                      </span>
                    </button>
                  </NoiseBackground>
              )}
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className={`flex flex-col ${resolvedTheme === 'dark' ? 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500/30' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'} rounded-3xl border-2`}>
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
              <div className="grid items-center justify-center w-full grid-cols-1 text-left">
                <div>
                  <h2 className={`text-lg font-medium tracking-tighter ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-600'} lg:text-3xl`}>
                    გოლდი
                  </h2>
                  <p className={`mt-2 text-sm ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>ყველაზე კარგი პაკი</p>
                </div>
                <div className="mt-6">
                  <p>
                    <span className={`text-5xl font-light tracking-tight ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
                      <OrbitIcon className="w-12 h-12 inline mr-2" />299
                    </span>
                    <span className={`text-base font-medium ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}> /თვე </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex px-6 pb-8 sm:px-8">
              {paymentProcessing === 'enterprise' ? (
                <div className="flex justify-center">
                  <NoiseBackground
                    containerClassName="full-with noise-bg-full p-2 rounded-full mx-auto"
                    gradientColors={["rgb(251, 146, 60)", "rgb(250, 204, 21)", "rgb(254, 240, 138)"]}>
                    <div className="full-with px-8 py-3 text-gray-500 rounded-full bg-white">
                      Processing...
                    </div>
                  </NoiseBackground>
                </div>
              ) : (
                  <NoiseBackground
                    containerClassName="full-with noise-bg-full p-2 rounded-full mx-auto"
                    gradientColors={["rgb(251, 146, 60)", "rgb(250, 204, 21)", "rgb(254, 240, 138)"]}>
                    <button
                      onClick={() => handleBalancePurchase('enterprise', 299)}
                      className="full-with h-full w-full cursor-pointer rounded-full bg-gradient-to-r from-neutral-100 via-neutral-100 to-white px-8 py-3 text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-95 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]">
                      <span className="flex items-center justify-center w-full">
                        გადახდა
                      </span>
                    </button>
                  </NoiseBackground>
              )}
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className={`backdrop-blur-sm rounded-2xl p-8 border mb-16 ${resolvedTheme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Wallet className={`w-8 h-8 ${resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              <div>
                <h3 className={`text-2xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  თქვენი ბალანსი
                </h3>
                <p className={`text-3xl font-bold mt-2 ${resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  <OrbitIcon className="w-8 h-8 inline mr-2" />
                  {loading ? '...' : userBalance}
                </p>
              </div>
            </div>
            <NoiseBackground
              containerClassName="noise-bg-full p-2 rounded-full"
              gradientColors={["rgb(168, 85, 247)", "rgb(236, 72, 153)", "rgb(251, 146, 60)"]}>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="flex items-center gap-2 h-full px-6 py-3 cursor-pointer rounded-full bg-gradient-to-r from-neutral-100 via-neutral-100 to-white text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-95 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]">
                <Plus className="w-5 h-5" />
                შევსება
              </button>
            </NoiseBackground>
          </div>
          {userBalance < 5 && (
            <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border`}>
              <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
                ⚠️ პრემიუმის შესაძენად საჭიროა მინიმუმ 5₾ ბალანსზე
              </p>
            </div>
          )}
        </div>

        {/* Premium Features Grid */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold text-center mb-12 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>პრემიუმ პრივილეგიები</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm rounded-xl p-6 border`}>
              <Palette className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>კუსტომიზაცია</h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>პერსონალური დიზაინი, ფერების შეცვლა, ფონტების არჩევა</p>
            </div>
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm rounded-xl p-6 border`}>
              <BarChart className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>ანალიტიკა</h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>დეტალური სტატისტიკა, ვიზიტორების ანალიზი, კლიკების მეტრიკა</p>
            </div>
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm rounded-xl p-6 border`}>
              <Globe className="w-8 h-8 text-green-400 mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>დომენი</h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>საკუთარი დომენის მიერთება, SSL სერტიფიკატი</p>
            </div>
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm rounded-xl p-6 border`}>
              <Shield className="w-8 h-8 text-red-400 mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>უსაფრთხოება</h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>2FA ავთენტიფიკაცია, პრივატული პროფილი, დაცვა</p>
            </div>
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm rounded-xl p-6 border`}>
              <Zap className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>სიჩქარე</h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>CDN ინტეგრაცია, სწრაფი ჩატვირთვა, ოპტიმიზაცია</p>
            </div>
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm rounded-xl p-6 border`}>
              <Users className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>გუნდური</h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>მრავალი მომხმარებელი, როლები, წვდომის მართვა</p>
            </div>
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm rounded-xl p-6 border`}>
              <Star className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>ბეჯი</h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>პრემიუმ ბეჯები, სპეციალური სტატუსები</p>
            </div>
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm rounded-xl p-6 border`}>
              <Crown className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>პრიორიტეტი</h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>პრიორიტეტული მხარდაჭერა, 24/7 დახმარება</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`text-center backdrop-blur-sm rounded-2xl p-12 border ${resolvedTheme === 'dark' ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'}`}>
          <h2 className={`text-3xl font-bold mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>მზად ხართ განვითარდეთ?</h2>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            შეუერთდით ათასობით მომხმარებელს, რომლებიც უკვე იყენებენ LinkShot-ს თავიანთი ბრენდის გასაზრდელად
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              დაიწყეთ უფასოდ
            </Button>
            <Button size="lg" variant="outline" className={`${resolvedTheme === 'dark' ? 'border-purple-500 text-purple-400 hover:bg-purple-500/10' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}>
              მეტის ნახვა
            </Button>
          </div>
        </div>
      </div>
      
      {/* Top-up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${resolvedTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border max-w-md w-full mx-4`}>
            <h3 className={`text-2xl font-bold mb-6 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ბალანსის შევსება
            </h3>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                თანხა (₾)
              </label>
              <input
                type="number"
                min="5"
                step="1"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="მინიმუმ 5₾"
              />
              <p className={`text-sm mt-2 ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                მინიმალური თანხა: 5₾
              </p>
            </div>
            <div className="flex gap-4">
              <NoiseBackground
                containerClassName="noise-bg-full p-2 rounded-full flex-1"
                gradientColors={["rgb(168, 85, 247)", "rgb(236, 72, 153)", "rgb(251, 146, 60)"]}>
                <button
                  onClick={handleTopUp}
                  className="w-full h-full px-6 py-3 cursor-pointer rounded-full bg-gradient-to-r from-neutral-100 via-neutral-100 to-white text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-95 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]">
                  PayPal-ით შევსება
                </button>
              </NoiseBackground>
              <button
                onClick={() => {
                  setShowTopUpModal(false);
                  setTopUpAmount("");
                }}
                className={`px-6 py-3 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}>
                გაუქმება
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumPage;
