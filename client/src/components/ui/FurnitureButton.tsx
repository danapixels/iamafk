import React, { useState } from 'react';

interface FurnitureButtonProps {
  src: string;
  hoverSrc: string;
  alt: string;
  type: string;
  onClick: (type: string) => void;
}

const FurnitureButton: React.FC<FurnitureButtonProps> = ({ src, hoverSrc, alt, type, onClick }) => {
  const [imgSrc, setImgSrc] = useState(src);
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      className="button"
      onClick={() => onClick(type)}
      onMouseEnter={() => setImgSrc(hoverSrc)}
      onMouseLeave={() => setImgSrc(src)}
    />
  );
};

export default FurnitureButton; 