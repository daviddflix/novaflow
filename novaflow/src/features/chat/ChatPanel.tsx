import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { extractMentions } from './mentionUtils';

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  inserted_at?: string;
}

export interface ChatPanelProps {
  workspaceId: string;
  currentUserId: string;
}

const notify = (msg: string) => {
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(msg);
  } else {
    console.error(msg);
  }
};

const mentionRegex = /@([a-zA-Z0-9_]+)/g;

const renderContent = (content: string) => {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index));
    }
    nodes.push(
      <span key={match.index} className="mention">
        @{match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }
  return nodes;
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ workspaceId, currentUserId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ChatMessages',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        payload => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [workspaceId]);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content) return;

    setText('');

    const messagePayload = {
      workspace_id: workspaceId,
      sender_id: currentUserId,
      message: content,
    };

    const { data, error } = await supabase.from('ChatMessages').insert(messagePayload);

    if (error) {
      notify('Failed to send message.');
      return;
    }

    const inserted = Array.isArray(data) ? (data[0] as ChatMessage) : (data as ChatMessage);
    setMessages(prev => [...prev, inserted]);

    const mentions = extractMentions(content);
    for (const username of mentions) {
      await supabase.from('Mentions').insert({
        source_type: 'chat',
        source_id: inserted.id,
        mentioned_username: username,
        created_by: currentUserId,
      });
      await supabase.from('Notifications').insert({
        user_username: username,
        type: 'mention',
        source_id: inserted.id,
      });
    }
  }, [text, workspaceId, currentUserId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      <div className="message-list">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <strong>{msg.sender_id}</strong>: {renderContent(msg.message)}
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button type="button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;

