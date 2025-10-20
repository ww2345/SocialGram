import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function FriendRequests(){
  const [incoming,setIncoming] = useState([]);
  const [outgoing,setOutgoing] = useState([]);

  async function load(){
    try{
      const res = await api.get('/api/requests');
      setIncoming(res.data.incoming || []);
      setOutgoing(res.data.outgoing || []);
    }catch(e){ console.error(e); }
  }
  useEffect(()=>{ load(); }, []);

  async function accept(id){
    await api.post('/api/requests/'+id+'/accept');
    load();
  }
  async function decline(id){
    await api.post('/api/requests/'+id+'/decline');
    load();
  }

  return (
    <div>
      <div className='card'>
        <h2 className='glow-text'>Incoming Requests</h2>
        <div className='user-list'>
          {incoming.length===0 && <div className='small'>No incoming requests</div>}
          {incoming.map(r=>(
            <div className='user-item' key={r._id}>
              <div>
                <div style={{fontWeight:700}}>{r.from.username}</div>
                <div className='small'>sent you a request</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className='btn btn-primary' onClick={()=>accept(r._id)}>Accept</button>
                <button className='btn btn-ghost' onClick={()=>decline(r._id)}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{height:12}}/>

      <div className='card'>
        <h2 className='glow-text'>Outgoing Requests</h2>
        <div className='user-list'>
          {outgoing.length===0 && <div className='small'>No outgoing requests</div>}
          {outgoing.map(r=>(
            <div className='user-item' key={r._1}>
              <div>
                <div style={{fontWeight:700}}>{r.to.username}</div>
                <div className='small'>request sent</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}