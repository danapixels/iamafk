import React from 'react';

const NotFound: React.FC = () => {
return (
<div style={{
backgroundColor: '#111111',
width: '100vw',
height: '100vh',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
margin: 0,
padding: 0
>
<img 
src="/UI/404.png" 
alt="404 - Page Not Found"
style={{
maxWidth: '100%',
maxHeight: '100%',
objectFit: 'contain'

/>
</div>
);
;

export default NotFound; 