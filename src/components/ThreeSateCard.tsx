import { ThreeStateToggle, ThreeStateToggleProps } from "./ThreeStateToggle";

interface ThreeStateCardProps<T> extends ThreeStateToggleProps<T> {}

export const ThreeStateCard = <T,>({
  initialState,
  leftLabel,
  rightLabel,
  leftIcon,
  rightIcon,
  leftValue,
  rightValue,
  onStateChange,
  leftDescription,
  rightDescription,
}: ThreeStateCardProps<T>) => {
  return (
    <div className="relative px-12 py-36 bg-white/60 rounded-3xl backdrop-blur-lg text-center overflow-hidden">
      <div className="z-10">
        <ThreeStateToggle
          initialState={initialState}
          leftLabel={leftLabel}
          rightLabel={rightLabel}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          leftValue={leftValue}
          rightValue={rightValue}
          onStateChange={onStateChange}
          leftDescription={leftDescription}
          rightDescription={rightDescription}
        />
      </div>

      <div
        className={`-z-10 transition-all duration-700 absolute bg-primary-ornament scale-125 pointer-events-none ${initialState === null ? "top-0 left-[50%] opacity-10 -translate-x-1/2 -translate-y-[80%]" : initialState === rightValue ? "opacity-40 -top-72 left-[100%] -translate-x-1/2 -translate-y-1/2" : "opacity-40 -top-72 left-0 -translate-x-1/2 -translate-y-1/2"} w-[max(75vh,75vh)] h-[max(75vh,75vh)] rounded-full blur-[90px]`}
      ></div>
    </div>
  );
};
