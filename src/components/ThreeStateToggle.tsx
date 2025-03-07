import React, { useState } from "react";
import { Icon } from "@iconify/react";

export interface ThreeStateToggleProps<T> {
  initialState?: T | null;
  leftLabel?: string;
  leftDescription?: React.ReactNode;
  rightLabel?: string;
  rightDescription?: React.ReactNode;
  leftIcon?: string | null;
  rightIcon?: string | null;
  leftValue: T;
  rightValue: T;
  onStateChange?: (newState: T | null) => void;
}

export const ThreeStateToggle = <T,>({
  initialState = null,
  leftLabel = "Off",
  leftDescription,
  rightLabel = "On",
  rightDescription,
  leftIcon = null,
  rightIcon = null,
  leftValue,
  rightValue,
  onStateChange,
}: ThreeStateToggleProps<T>) => {
  const [state, setState] = useState<T | null>(initialState);
  const [previousState, setPreviousState] = useState<T | null>(null);

  const toggleState = (newState: T | null) => {
    setPreviousState(state);
    setState(newState);

    if (onStateChange) {
      onStateChange(newState);
    }
  };

  const handleClick = () => {
    let newState: T | null;
    if (state === null && previousState === rightValue) {
      newState = leftValue;
    } else if (state === null && previousState === leftValue) {
      newState = rightValue;
    } else if (state === leftValue) {
      newState = rightValue;
    } else if (state === rightValue) {
      newState = leftValue;
    } else {
      newState = leftValue;
    }
    toggleState(newState);
  };

  return (
    <div className="flex items-center justify-center space-x-5">
      <div className="flex items-center justify-end flex-1">
        <div className="cursor-pointer select-none relative" onClick={() => toggleState(leftValue)}>
          <span>{leftLabel}</span>
          <span className="ml-2 text-xs absolute right-0 top-8 w-64 text-right">
            {leftDescription}
          </span>
        </div>
      </div>
      <div
        onClick={handleClick}
        className={`relative inline-flex h-12 w-24 cursor-pointer items-center rounded-full transition-colors duration-300 bg-opacity-40 bg-primary-ornament`}
      >
        <span
          className={`absolute transition-transform ml-1 duration-300 transform ${
            state === rightValue
              ? "translate-x-12"
              : state === leftValue
                ? "translate-x-0"
                : "translate-x-6"
          } h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center`}
        >
          {state === leftValue && leftIcon && (
            <Icon icon={leftIcon} className="text-lg text-primary-ornament" />
          )}
          {state === rightValue && rightIcon && (
            <Icon icon={rightIcon} className="text-lg text-primary-ornament" />
          )}
          {state === null && <Icon icon={"hugeicons:minus-sign"} className="text-lg" />}
        </span>
      </div>
      <div className="flex items-center justify-start flex-1">
        <div
          className="cursor-pointer select-none relative"
          onClick={() => toggleState(rightValue)}
        >
          <span>{rightLabel}</span>
          <span className="mr-2 text-xs absolute left-0 top-8 w-64 text-left">
            {rightDescription}
          </span>
        </div>
      </div>
    </div>
  );
};
