import React from 'react';
import { ArrowRight } from 'lucide-react';

const HoverButton = ({ children, onClick, className = "", ...props }) => {
  return (
    <button 
      className={`hover-button ${className}`}
      onClick={onClick}
      {...props}
    >
      <div className="bgContainer">
        <span>{children || 'Hover'}</span>
      </div>
      <div className="arrowContainer">
        <ArrowRight size={16} />
      </div>
    </button>
  );
};

export default HoverButton;
