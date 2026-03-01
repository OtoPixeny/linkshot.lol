import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';

const PremiumCancel = () => {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen py-12 px-4 ${resolvedTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className={`text-4xl font-bold mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            გადახდა გაუქმდა
          </h1>
          <p className={`text-xl ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            გადახდის პროცესი შეწყდა. თქვენი ბარათი არ დაქრილა.
          </p>
        </div>

        <div className={`rounded-2xl p-8 mb-8 ${resolvedTheme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border`}>
          <h2 className={`text-2xl font-semibold mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            რა მოხდა?
          </h2>
          <div className="text-left space-y-3">
            <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <p className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                • თქვენ გააუქმეთ გადახდა PayPal-ში
              </p>
            </div>
            <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <p className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                • გადახდის პროცესში შეცდომა მოხდა
              </p>
            </div>
            <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <p className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                • თქვენი ბანკის მიერ გადახდა არ დადასტურდა
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 mb-8 ${resolvedTheme === 'dark' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border`}>
          <h3 className={`text-lg font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
            საჭიროა დახმარება?
          </h3>
          <p className={resolvedTheme === 'dark' ? 'text-blue-300' : 'text-blue-600'}>
            დაგვიკავშირდით: linkshot@support.com | +995 555 123 456
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/premium')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            თავიდან ცდა
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate('/')}
            className={`${resolvedTheme === 'dark' ? 'border-gray-600 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            მთავარზე დაბრუნება
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumCancel;
