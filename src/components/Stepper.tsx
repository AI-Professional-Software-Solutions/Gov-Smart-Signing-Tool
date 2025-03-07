import React from "react";
import { Icon } from "@iconify/react";

interface Step {
  label: string;
  completed: boolean;
}

interface StepperProps {
  currentStepIndex: number;
  steps: Step[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStepIndex, steps }) => {
  const completedSteps = steps.filter((step) => step.completed).length;
  const isAllCompleted = completedSteps === steps.length;

  const getCircleColor = (completed: boolean, currentStep: boolean) => {
    return completed || currentStep
      ? "bg-primary-ornament text-white"
      : "bg-gray-300 text-gray-500";
  };

  const progress = currentStepIndex === 0 ? 0 : ((currentStepIndex + 1) / steps.length) * 100;
  const nextProgressStep = Math.min(((currentStepIndex + 2) / steps.length) * 100, 100);

  console.log("progress", progress);
  console.log("nextProgressStep", nextProgressStep);

  return (
    <div className="relative flex items-center justify-between w-full">
      <div className="absolute inset-0 flex items-center px-8">
        <div
          className={`w-full z-10 h-1 transition-all duration-500`}
          style={
            {
              backgroundImage: isAllCompleted
                ? `linear-gradient(to right, rgb(var(--color-primary-ornament)) ${100}%, transparent ${100}%)`
                : `linear-gradient(to right, rgb(var(--color-primary-ornament)) ${progress}%, transparent ${nextProgressStep}%)`,
            } as React.CSSProperties
          }
        />
      </div>
      <div className="absolute z-0 inset-0 flex items-center px-8">
        <div className={`w-full h-1 bg-gray-300 transition-all duration-500`}></div>
      </div>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`relative z-10 flex items-center ${index < steps.length - 1 ? "flex-grow" : ""}`}
        >
          <div className="relative flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${getCircleColor(
                step.completed,
                currentStepIndex === index,
              )} transition-all duration-100`}
            >
              <Icon
                icon={
                  currentStepIndex === index
                    ? "hugeicons:cursor-magic-selection-02"
                    : step.completed
                      ? "heroicons-outline:check"
                      : "material-symbols:pending-outline"
                }
                className={`text-2xl`}
              />
            </div>
            <span className="absolute top-14 text-xs text-gray-500 text-center w-32">
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
