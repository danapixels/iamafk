import React, { memo  from 'react';
import { UI_IMAGES, GITHUB_URL, Z_INDEX_LAYERS  from '../../constants';

export const Logo: React.FC = memo(() => {
return (
<div id="logo-container" style={{ zIndex: Z_INDEX_LAYERS.LOGO >
<div className="logo-row">
<img src={UI_IMAGES.LOGO alt="Logo" id="logo" />
<a 
href={GITHUB_URL 
target="_blank" 
rel="noopener noreferrer"
style={{ pointerEvents: 'all' 
>
<img src={UI_IMAGES.GITHUB_LOGO alt="GitHub" id="github-logo" />
</a>
</div>
</div>
);
); 