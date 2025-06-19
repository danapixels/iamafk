import React from 'react';

interface HatButtonProps {
src: string;
alt: string;
hatType: string;
onClick: (hatType: string) => void;


const HatButton: React.FC<HatButtonProps> = ({ src, alt, hatType, onClick ) => (
<img
src={src
alt={alt
className="button"
onClick={() => onClick(hatType)
/>
);

export default HatButton; 