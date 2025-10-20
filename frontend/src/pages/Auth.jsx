import React, { useState } from 'react';
import api from '../utils/api';

export default function Auth({ onLogin }){
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e){
    e.preventDefault();
    try{
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, username };
      const res = await api.post(url, body);
      localStorage.setItem('token', res.data.token);
      // store user id for conversation building
      if(res.data.user && (res.data.user.id || res.data.user._id)){
        localStorage.setItem('userId', res.data.user.id || res.data.user._id);
      }
      onLogin(res.data.user);
    }catch(err){
      alert(err.response?.data?.error || 'Error');
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}>
      <div className='card' style={{width:420}}>
        <h2 className='glow-text'>{mode==='login' ? 'Login' : 'Register'}</h2>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:10,marginTop:12}}>
          {mode==='register' && <input className='input' placeholder='Username' value={username} onChange={e=>setUsername(e.target.value)} />}
          <input className='input' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} />
          <input className='input' type='password' placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} />
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className='btn btn-primary' type='submit'>Submit</button>
            <button type='button' className='btn btn-ghost' onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Create account':'Have account? Login'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}