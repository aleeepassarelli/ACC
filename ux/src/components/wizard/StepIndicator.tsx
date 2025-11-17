import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-border -z-10">
          <div
            className="h-full bg-gradient-primary transition-all duration-500"
            style={{
              width: `${(completedSteps.length / (steps.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;
          const isAccessible = step.number <= currentStep || isCompleted;

          return (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 mb-3",
                  "border-2 font-semibold text-sm",
                  isCompleted && "bg-success border-success text-success-foreground shadow-accent",
                  isCurrent && !isCompleted && "bg-primary border-primary text-primary-foreground shadow-accent scale-110",
                  !isCompleted && !isCurrent && isAccessible && "bg-background border-border text-muted-foreground",
                  !isAccessible && "bg-muted border-muted text-muted-foreground opacity-50"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <div className="text-center">
                <div
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
