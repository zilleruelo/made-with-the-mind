import React, { useState, useEffect } from 'react';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

const Knob: React.FC<KnobProps> = ({ value, min, max, onChange, label }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(value);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const sensitivity = 200; // Adjust this value to change knob sensitivity
      const deltaY = startY - e.clientY;
      const range = max - min;
      const deltaValue = (deltaY / sensitivity) * range;
      const newValue = Math.min(max, Math.max(min, startValue + deltaValue));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, onChange, startY, startValue]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };

  // Calculate rotation angle (-150 to +150 degrees)
  const normalizedValue = (value - min) / (max - min);
  const rotation = -150 + (normalizedValue * 300);

  // Format display value
  const formatDisplayValue = () => {
    if (max > 1000) {
      return Math.round(value).toLocaleString();
    }
    return value.toFixed(max > 10 ? 0 : 2);
  };

  return (
    <div className="flex flex-col items-center group">
      <div
        className={`relative w-16 h-16 ${isDragging ? 'cursor-ns-resize' : 'cursor-pointer'}`}
        onMouseDown={handleMouseDown}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gray-700 bg-gray-800">
          {/* Indicator line */}
          <div
            className="absolute w-0.5 h-6 bg-indigo-500 rounded-full left-1/2 -translate-x-1/2 origin-bottom"
            style={{
              transform: `rotate(${rotation}deg) translateY(-25%)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          />
          
          {/* Value display */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-medium text-white bg-gray-900/80 px-2 py-1 rounded">
              {formatDisplayValue()}
            </span>
          </div>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-400">{label}</span>
    </div>
  );
};

export default Knob;