interface TimeControlsProps {
  currentTime: Date;
  isPlaying: boolean;
  animationSpeed: number;
  onTimeStepUpdate: (step: number) => void;
  onTogglePlayPause: () => void;
  onAnimationSpeedChange: (speed: number) => void;
}

export default function TimeControls({
  currentTime,
  isPlaying,
  animationSpeed,
  onTimeStepUpdate,
  onTogglePlayPause,
  onAnimationSpeedChange
}: TimeControlsProps) {
  
  const getCurrentTimeStep = () => {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const diffHours = Math.floor((currentTime.getTime() - dayAgo.getTime()) / (1000 * 60 * 60));
    return Math.max(0, Math.min(48, Math.floor(diffHours / 3))); // 3-hour steps
  };

  const handlePreviousTime = () => {
    const currentStep = getCurrentTimeStep();
    if (currentStep > 0) {
      onTimeStepUpdate(currentStep - 1);
    }
  };

  const handleNextTime = () => {
    const currentStep = getCurrentTimeStep();
    if (currentStep < 48) {
      onTimeStepUpdate(currentStep + 1);
    }
  };

  const formatTimeDisplay = (time: Date) => {
    return time.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short'
    });
  };

  const getForecastOffset = () => {
    const now = new Date();
    const diffHours = Math.floor((currentTime.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `+${diffHours}h forecast`;
    } else if (diffHours < -3) {
      return `${Math.abs(diffHours)}h ago`;
    }
    return "Current";
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 shadow-2xl">
      <div className="flex items-center space-x-4">
        
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors" 
            onClick={handlePreviousTime}
            data-testid="button-previous-time"
          >
            <i className="fas fa-step-backward text-gray-400"></i>
          </button>
          
          <button 
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors" 
            onClick={onTogglePlayPause}
            data-testid="button-play-pause"
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-green-500`}></i>
          </button>
          
          <button 
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors" 
            onClick={handleNextTime}
            data-testid="button-next-time"
          >
            <i className="fas fa-step-forward text-gray-400"></i>
          </button>
        </div>

        {/* Time Display */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="text-sm font-medium" data-testid="text-current-time">
            {formatTimeDisplay(currentTime)}
          </div>
          
          {/* Time Slider */}
          <div className="flex-1 px-4">
            <input 
              type="range" 
              min="0" 
              max="48" 
              value={getCurrentTimeStep()}
              onChange={(e) => onTimeStepUpdate(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" 
              data-testid="input-time-slider"
            />
            
            {/* Time Markers */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2d ago</span>
              <span>1d ago</span>
              <span>Now</span>
              <span>+1d</span>
              <span>+2d</span>
            </div>
          </div>

          <div className="text-sm text-gray-400" data-testid="text-forecast-offset">
            {getForecastOffset()}
          </div>
        </div>

        {/* Animation Speed */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Speed:</span>
          <select 
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            value={`${animationSpeed}x`}
            onChange={(e) => onAnimationSpeedChange(parseFloat(e.target.value.replace('x', '')))}
            data-testid="select-animation-speed"
          >
            <option value="0.5x">0.5x</option>
            <option value="1x">1x</option>
            <option value="2x">2x</option>
            <option value="4x">4x</option>
          </select>
        </div>
      </div>
    </div>
  );
}
