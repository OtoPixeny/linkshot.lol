import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';
import { useTheme } from 'next-themes';

const PremiumSuccess = () => {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen py-12 px-4 ${resolvedTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className={`text-4xl font-bold mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            გადახდა წარმატებით შესრულდა!
          </h1>
          <p className={`text-xl ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            გმადლობთ პრემიუმ პლანის შეძენისთვის. თქვენი პრივილეგიები აქტიურდება რამდენიმე წუთში.
          </p>
        </div>

        <div className={`rounded-2xl p-8 mb-8 ${resolvedTheme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border`}>
          <h2 className={`text-2xl font-semibold mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            რა შეგიძლიათ ახლა?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🎨 კუსტომიზაცია
              </h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                პერსონალური დიზაინი და ბრენდინგი
              </p>
            </div>
            <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📊 ანალიტიკა
              </h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                დეტალური სტატისტიკა და მეტრიკები
              </p>
            </div>
            <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🌐 დომენი
              </h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                საკუთარი დომენის მიერთება
              </p>
            </div>
            <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🛡️ უსაფრთხოება
              </h3>
              <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                პრემიუმ უსაფრთხოების ფუნქციები
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            დეშბორდზე გადასვლა
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate('/')}
            className={`${resolvedTheme === 'dark' ? 'border-purple-500 text-purple-400 hover:bg-purple-500/10' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}
          >
            <Home className="w-4 h-4 mr-2" />
            მთავარზე დაბრუნება
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumSuccess;
