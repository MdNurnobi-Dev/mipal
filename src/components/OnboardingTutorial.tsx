import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { Briefcase, Wallet, ArrowRight, Check, Sparkles } from 'lucide-react';

export default function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);
  const { siteSettings } = useApp();

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenTutorial');
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const steps = [
    {
      icon: Sparkles,
      title: `Welcome to ${siteSettings.siteName}!`,
      description: "Your journey to easy daily earnings starts here. Let us show you around quickly.",
      alignment: "center"
    },
    {
      icon: Briefcase,
      title: "Complete Tasks",
      description: "Head over to the Tasks tab to watch ads, take quizzes, and earn cash instantly.",
      alignment: "bottom-left"
    },
    {
      icon: Wallet,
      title: "Manage Your Wallet",
      description: "Check your balance, claim daily check-ins, and withdraw your earnings from the Wallet tab.",
      alignment: "bottom-right"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-center items-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden rounded-inherit">
      <div className={`bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl transform transition-transform duration-500 relative
        ${currentStep.alignment === 'bottom-left' ? 'translate-y-32 sm:translate-y-24' : ''}
        ${currentStep.alignment === 'bottom-right' ? 'translate-y-32 sm:translate-y-24' : ''}
      `}>
        {/* Spotlight indicator pointing down to bottom nav */}
        {currentStep.alignment === 'bottom-left' && (
          <div className="absolute -bottom-3 left-1/4 w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-white border-r-[12px] border-r-transparent drop-shadow-md"></div>
        )}
        {currentStep.alignment === 'bottom-right' && (
          <div className="absolute -bottom-3 right-1/4 w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-white border-r-[12px] border-r-transparent drop-shadow-md"></div>
        )}

        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2">{currentStep.title}</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{currentStep.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-5 bg-indigo-600' : 'w-1.5 bg-slate-200'}`} />
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={handleClose} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Skip
            </button>
            <button 
              onClick={handleNext}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
            >
              {step === steps.length - 1 ? (
                <>Finish <Check className="w-4 h-4" /></>
              ) : (
                <>Next <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
