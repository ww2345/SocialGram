import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar({ user, onLogout }){
  return (
    <aside className='navbar card'>
      <div className='brand'>
        <div className='logo'>SG</div>
        <div>
          <h1>SocialGram</h1>
          <div className='small'>Welcome, <span className='glow-text'>{user.username}</span></div>
        </div>
      </div>

      <nav className='nav-links'>
        <NavLink to='/' className={({isActive})=> 'nav-link ' + (isActive? 'active':'')}>Home</NavLink>
        <NavLink to='/create-post' className={({isActive})=> 'nav-link ' + (isActive? 'active':'')}>New post</NavLink>
        <NavLink to='/explore' className={({isActive})=> 'nav-link ' + (isActive? 'active':'')}>Explore</NavLink>
        <NavLink to='/search' className={({isActive})=> 'nav-link ' + (isActive? 'active':'')}>Search</NavLink>
        <NavLink to='/requests' className={({isActive})=> 'nav-link ' + (isActive? 'active':'')}>Requests</NavLink>
        <NavLink to='/friends' className={({isActive})=> 'nav-link ' + (isActive? 'active':'')}>Friends</NavLink>
        <NavLink to='/account' className={({isActive})=> 'nav-link ' + (isActive? 'active':'')}>Account</NavLink>
        <NavLink to='/about' className={({isActive})=> 'nav-link ' + (isActive? 'active':'')}>About</NavLink>
        

        <button onClick={onLogout} className='nav-link' style={{border:'none',background:'transparent',textAlign:'left'}}>Logout</button>
      </nav>
    </aside>
  );
}