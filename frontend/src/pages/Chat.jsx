import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../utils/api';

export default function Chat({ user }){
  const { conversationId } = useParams();
  const [messages,setMessages] = useState([]);
  const [text,setText] = useState('');
  const socketRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(()=>{
    if(!conversationId) return;
    api.get('/api/messages/' + conversationId).then(r=> setMessages(r.data)).catch(()=>{});
    const token = localStorage.getItem('token');
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', { auth: { token } });
    socketRef.current = socket;
    socket.emit('joinConversation', conversationId);
    socket.on('message', (m) => {
      if(m.conversationId === conversationId){
        setMessages(prev=>[...prev, m]);
      }
    });
    return ()=> socket.disconnect();
  },[conversationId]);

  useEffect(()=>{ if(boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; },[messages]);

  function send(){
    if(!text.trim()) return;
    const to = conversationId.split('_').find(id => id !== (user._id || user.id));
    socketRef.current.emit('sendMessage', { conversationId, to, text });
    setText('');
  }

  return (
    <div>
      <div className='card chat-window'>
        <div className='chat-messages' ref={boxRef}>
          {messages.map(m=>(
            <div key={m._id || m.createdAt} className={'message ' + (String(m.from) === String(user._id || user.id) ? 'me' : '')}>
              <div style={{fontSize:12}} className='small'>{m.from}</div>
              <div>{m.text}</div>
              <div style={{fontSize:11,opacity:0.6}} className='small'>{new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
        <div className='input-row'>
        <div className="search-box">
          <input  // this will take the style from searchbox css in index.css file this is chat section typebox. 
          value={text}
          onChange={e => setText(e.target.value)}
          className="search-input"
          placeholder="Type a message..."
          onKeyDown={e => e.key === 'Enter' && send()}
        />
      </div>

          <button className='btn btn-primary' onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}