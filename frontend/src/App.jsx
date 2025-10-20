import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import SearchUsers from './pages/SearchUsers';
import FriendRequests from './pages/FriendRequests';
import FriendsList from './pages/FriendsList';
import Chat from './pages/Chat';
import Navbar from './components/Navbar';
import api from './utils/api';
import About from "./pages/About";


export default function App(){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    const token = localStorage.getItem('token');
    if(!token){ setLoading(false); return; }
    api.get('/api/users/me').then(r=>{
      setUser(r.data);
    }).catch(e=>{
      localStorage.removeItem('token');
    }).finally(()=>setLoading(false));
  },[]);

  if(loading) return <div className='neon-center'>Loading...</div>;
  if(!user) return <Auth onLogin={(u)=> setUser(u)} />;

  return (
    <Router>
      <div className='app-grid'>
        <Navbar user={user} onLogout={() => { localStorage.removeItem('token'); setUser(null); }} />
        <main className='main-panel'>
          <Routes>
            <Route path='/' element={<Home user={user} />} />
            <Route path='/search' element={<SearchUsers user={user} />} />
            <Route path='/requests' element={<FriendRequests user={user} />} />
            <Route path='/friends' element={<FriendsList user={user} />} />
            <Route path='/chat/:conversationId' element={<Chat user={user} />} />
            <Route path='*' element={<Navigate to='/' />} />
            <Route path="/about" element={<About />} />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}
