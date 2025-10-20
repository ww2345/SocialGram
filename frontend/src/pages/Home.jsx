import React from 'react';
export default function Home(){ 
  return (
    <div>
      <div className='card'>
        <h2 className='glow-text'>Home Feed</h2>
        <p className='small'> posts coming soon. Use Search to find people and Requests to manage friends.</p>
      </div>
      <div style={{height:14}}/>
      <div className='card'>
        <h3 className='glow-text'>Quick Tips</h3>
        <ul className='small'>
          <li>Search users & send requests</li>
          <li>Accept requests to become friends</li>
          <li>Open chat from friends list</li>
        </ul>
      </div>
    </div>
  );
}