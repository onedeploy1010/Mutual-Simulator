import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WizardStep {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface MobileWizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  isValid?: boolean;
}

export function MobileWizard({ steps, onComplete, isValid = true }: MobileWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();
  const isLastStep = currentStep === steps.length - 1;

  const goNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const goBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`step-indicator ${
                index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending'
              }`}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-1 mx-1 rounded-full ${
                  index < currentStep ? 'bg-chart-2' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground">
          {steps[currentStep].title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t.step} {currentStep + 1} / {steps.length}
        </p>
      </div>

      <Card className="p-6 card-luxury glass-card">
        {steps[currentStep].content}
      </Card>

      <div className="flex gap-3 pt-4">
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="flex-1"
            data-testid="button-wizard-back"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t.back}
          </Button>
        )}
        <Button
          type="button"
          onClick={goNext}
          disabled={!isValid}
          className="flex-1"
          data-testid="button-wizard-next"
        >
          {isLastStep ? (
            <>
              {t.calculate}
              <Check className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              {t.next}
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
