interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => (
  <div className="flex items-center gap-2 w-full">
    <div className="relative flex-1 h-2 bg-gray-200 rounded">
      <div
        className="h-2 bg-green-500 transition-all duration-300 rounded"
        style={{ width: `${percentage}%` }}
      />
    </div>
    <span className="text-sm">{`${percentage}%`}</span>
  </div>
);

export default ProgressBar;