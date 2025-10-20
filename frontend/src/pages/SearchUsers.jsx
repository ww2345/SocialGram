import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function SearchUsers(){
  const [q,setQ] = useState('');
  const [results,setResults] = useState([]);
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    if(q.trim().length===0){ setResults([]); return; }
    const t = setTimeout(async ()=>{
      setLoading(true);
      try{
        const res = await api.get('/api/users/search?q=' + encodeURIComponent(q));
        setResults(res.data);
      }catch(e){ console.error(e) }
      setLoading(false);
    },250);
    return ()=>clearTimeout(t);
  },[q]);

  async function sendRequest(id){
    try{
      await api.post('/api/requests/send',{ toUserId: id });
      alert('Request sent');
    }catch(e){
      alert(e.response?.data?.error || 'Error');
    }
  }

  return (
    <div>
      <div className='card'>
        <h2 className='glow-text'>Search Users</h2>
        <div className='search-box'>
  <input
    className='search-input'
    placeholder='Search username...'
    value={q}
    onChange={e=>setQ(e.target.value)}
  />
</div>

        {loading && <div className='small'>Searching...</div>}
        <div className='user-list'>
          {results.map(u=>(
            <div className='user-item' key={u._id}>
              <div>
                <div style={{fontWeight:700,color:'#e6f7ff'}}>{u.username}</div>
                <div className='small'>{u.bio || 'No bio'}</div>
              </div>
              <div>
                <button className='btn btn-primary' onClick={()=>sendRequest(u._id)}>Send Request</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}