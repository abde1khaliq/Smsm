'use client';

import { useEffect, useRef, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { colors, getGreeting, inter } from './chat/Extras';
import { ChatMessage } from './chat/types';
import { ChatStyles } from './chat/ChatStyles';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatComposer } from './chat/ChatComposer';

const ChatComponent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [greeting, setGreeting] = useState('Hello');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamReply = async (replyId: string, promptText: string) => {
    setIsBusy(true);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === replyId
          ? { ...m, content: '', status: 'thinking', chunks: [], error: false }
          : m
      )
    );

    try {
      const res = await fetch(`/api/chat/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        if (!chunkText) continue;

        accumulated += chunkText;
        const chunkId = crypto.randomUUID();

        setMessages((prev) =>
          prev.map((m) =>
            m.id === replyId
              ? {
                  ...m,
                  content: accumulated,
                  status: 'streaming',
                  chunks: [...(m.chunks ?? []), { id: chunkId, text: chunkText }],
                }
              : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === replyId ? { ...m, status: undefined } : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === replyId
            ? {
                ...m,
                content:
                  "Couldn't reach the server. Make sure the API is running and reachable, then try again.",
                status: undefined,
                error: true,
                chunks: undefined,
              }
            : m
        )
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isBusy) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const replyId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: replyId,
        role: 'assistant',
        content: '',
        status: 'thinking',
        chunks: [],
        replyToText: text,
      },
    ]);

    await streamReply(replyId, text);
  };

  const handleNewChat = () => setMessages([]);

  return (
    <Flex
      direction="column"
      h="100dvh"
      bg={colors.base}
      overflow="hidden"
      className={inter.className}
    >
      <ChatStyles />
      <ChatHeader onNewChat={handleNewChat} />
      <ChatMessages messages={messages} greeting={greeting} bottomRef={bottomRef} />
      <ChatComposer
        input={input}
        setInput={setInput}
        isBusy={isBusy}
        onSend={handleSend}
        textareaRef={textareaRef}
      />
    </Flex>
  );
};

export default ChatComponent;