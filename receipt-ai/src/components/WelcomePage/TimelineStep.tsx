interface TimelineStepProps {
  stepNumber: number;
  icon: string;
  title: string;
  description: string;
  bgColor?: string;
  textColor?: string;
}

const TimelineStep = ({
  stepNumber,
  icon,
  title,
  description,
  bgColor = "bg-primary",
  textColor = "text-on-primary",
}: TimelineStepProps) => {
  return (
    <div className="flex gap-8 items-start relative">
      <div
        className={`z-10 w-16 h-16 shrink-0 rounded-full ${bgColor} flex items-center justify-center ${textColor} font-headline font-bold text-xl shadow-lg`}
      >
        <span className="material-symbols-outlined" data-icon={icon}>
          {icon}
        </span>{" "}
      </div>
      <div className="pt-3">
        <h4 className="font-headline text-lg font-bold text-on-surface">
          {title}
        </h4>
        <p className="text-on-surface-variant text-sm mt-1">{description}</p>
      </div>
    </div>
  );
};

export default TimelineStep;
