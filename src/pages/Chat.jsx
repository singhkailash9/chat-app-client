import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import UserList from '../components/UserList';

const ROOMS = ['general', 'tech', 'random'];

export default function Chat() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/messages/${room}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };
    socket.auth = { token };
    if (!socket.connected) socket.connect();

    socket.emit('joinRoom', { room });

    fetchMessages();

    // Listeners
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socket.on('receiveMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('userJoined', ({ message }) => {
      setMessages(prev => [...prev, { type: 'system', text: message }]);
    });

    socket.on('userLeft', ({ message }) => {
      setMessages(prev => [...prev, { type: 'system', text: message }]);
    });

    return () => {
      socket.emit('leaveRoom', { room });
      socket.off('receiveMessage');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('onlineUsers');
    };
  }, [room, token]);

  const handleSend = (text) => {
    socket.emit('sendMessage', { text, room });
  };

  const handleLogout = () => {
    socket.disconnect();
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen bg-gray-950 flex">

      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">

        <div className="p-4 border-b border-gray-800">
          <h1 className="text-white font-bold text-lg">💬 ChatApp</h1>
          <p className="text-gray-400 text-sm mt-1">@{user?.username}</p>
        </div>

        <div className="flex-1 p-4">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
            Rooms
          </p>
          <div className="space-y-1">
            {ROOMS.map(r => (
              <button
                key={r}
                onClick={() => setRoom(r)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  room === r
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                # {r}
              </button>
            ))}
          </div>
        </div>

        <UserList users={onlineUsers} />

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full text-left text-gray-500 hover:text-red-400 text-sm transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
          >
            → Sign out
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">

        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900">
          <h2 className="text-white font-semibold"># {room}</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            {room === 'general' && 'General discussion'}
            {room === 'tech' && 'Tech talk'}
            {room === 'random' && 'Anything goes'}
          </p>
        </div>

        {loading
        ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Loading messages...</p>
          </div>
        )
        : messages.length === 0
        ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-sm">No messages yet. Say hello! 👋</p>
          </div>
        )
        : <MessageList messages={messages} />
      }

        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}