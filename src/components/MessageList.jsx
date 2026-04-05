import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MessageList({ messages }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg, i) => {
        if (msg.type === 'system') {
          return (
            <div key={i} className="text-center">
              <span className="text-gray-500 text-xs bg-gray-800 px-3 py-1 rounded-full">
                {msg.text}
              </span>
            </div>
          );
        }

        const isMe = msg.senderName === user?.username;

        return (
          <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
              {!isMe && (
                <span className="text-gray-400 text-xs mb-1 ml-1">{msg.senderName}</span>
              )}
              <div className={`px-4 py-2 rounded-2xl text-sm ${
                isMe
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-100 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-gray-600 text-xs mt-1 mx-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}