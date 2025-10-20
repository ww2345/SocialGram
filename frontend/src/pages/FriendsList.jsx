import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

export default function FriendsList(){
  const [friends,setFriends] = useState([]);
  useEffect(()=>{
    async function load(){
      try{
        const res = await api.get('/api/users/me');
        setFriends(res.data.friends || []);
      }catch(e){ console.error(e); }
    }
    load();
  },[]);

  function conversationId(a,b){
    return [a,b].sort().join('_');
  }

  return (
    <div>
      <div className='card'>
        <h2 className='glow-text'>Your Friends</h2>
        <div className='user-list'>
          {friends.length===0 && <div className='small'>You have no friends yet</div>}
          {friends.map(f=>(
            <div className='user-item' key={f._id}>
              <div>
                <div style={{fontWeight:700,color:'#e6f7ff'}}>{f.username}</div>
              </div>
              <div>
                <Link to={'/chat/'+conversationId(f._id, localStorage.getItem('userId') || '')}>
                  <button className='btn btn-primary'>Chat</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}