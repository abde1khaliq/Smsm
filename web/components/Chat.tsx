'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { ArrowUp, Menu, Plus } from 'lucide-react';
import { colors, getGreeting, inter, Message, Orb, wordmark } from './utils/Extras';

const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
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

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isBusy) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsBusy(true);

    const replyId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: replyId, role: 'assistant', content: '', status: 'thinking' },
    ]);

    try {
      const res = await fetch(`/api/chat/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
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
        setMessages((prev) =>
          prev.map((m) =>
            m.id === replyId
              ? { ...m, content: accumulated, status: 'streaming' }
              : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === replyId ? { ...m, status: undefined } : m))
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === replyId
            ? {
                ...m,
                content:
                  "Couldn't reach the server. Make sure the API is running and reachable, then try again.",
                status: undefined,
                error: true,
              }
            : m
        )
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => setMessages([]);

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <Flex
      direction="column"
      h="100dvh"
      bg={colors.base}
      overflow="hidden"
      className={inter.className}
    >
      <style>{`
        @keyframes smsm-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .smsm-cursor {
          display: inline-block;
          width: 2px;
          height: 1.05em;
          background: ${colors.text};
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: smsm-blink 1s step-start infinite;
        }
        .smsm-textarea::placeholder {
          color: ${colors.placeholder};
        }

        .smsm-orb {
          border-radius: 9999px;
          background: radial-gradient(
            circle at 32% 28%,
            #F5F1E8 0%,
            #CBC2AC 32%,
            #6E6656 62%,
            #1B1B1E 100%
          );
          box-shadow:
            inset -3px -4px 7px rgba(0, 0, 0, 0.55),
            inset 2px 2px 5px rgba(255, 255, 255, 0.16),
            0 0 12px rgba(245, 241, 232, 0.20),
            0 0 26px rgba(245, 241, 232, 0.10);
          animation: smsm-breathe 4.2s ease-in-out infinite;
          transform-origin: center;
          will-change: transform;
        }
        .smsm-orb-active {
          animation-name: smsm-breathe-active;
          animation-duration: 1.7s;
        }
        .smsm-orb-thinking {
          animation: smsm-pulse-thinking 1.15s ease-in-out infinite;
        }
        .smsm-orb-thinking::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          border: 1.5px solid transparent;
          border-top-color: rgba(245, 241, 232, 0.85);
          animation: smsm-spin 0.9s linear infinite;
        }
        .smsm-orb-shine {
          position: absolute;
          width: 40%;
          height: 40%;
          top: 14%;
          left: 18%;
          border-radius: 9999px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0) 72%
          );
          filter: blur(0.4px);
          animation: smsm-shine-drift 5.5s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes smsm-breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.045) translateY(-1.5px); }
        }
        @keyframes smsm-breathe-active {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.09) translateY(-1px); }
        }
        @keyframes smsm-pulse-thinking {
          0%, 100% { transform: scale(1); opacity: 0.88; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes smsm-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes smsm-shine-drift {
          0%, 100% { top: 14%; left: 18%; opacity: 0.7; }
          50% { top: 9%; left: 27%; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .smsm-orb,
          .smsm-orb-active,
          .smsm-orb-thinking,
          .smsm-orb-thinking::before,
          .smsm-orb-shine {
            animation: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <Flex
        as="header"
        align="center"
        justify="space-between"
        px={4}
        py={3}
        borderBottom={`1px solid ${colors.hairline}`}
        flexShrink={0}
      >
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          color={colors.text}
          size="lg"
          _hover={{ bg: colors.hover }}
        >
          <Menu size={22} />
        </IconButton>

        <HStack gap={2}>
          <Orb size={22} />
        </HStack>

        <IconButton
          aria-label="New chat"
          variant="ghost"
          color={colors.text}
          size="lg"
          _hover={{ bg: colors.hover }}
          onClick={handleNewChat}
        >
          <Plus size={22} />
        </IconButton>
      </Flex>

      {/* Messages */}
      <Box flex="1" overflowY="auto">
        <VStack align="stretch" gap={6} px={4} py={6} maxW="640px" mx="auto">
          {messages.length === 0 && (
            <Flex
              flex="1"
              direction="column"
              align="center"
              justify="center"
              minH="60vh"
              gap={5}
              textAlign="center"
              px={6}
            >
              <Orb size={56} />
              <VStack gap={1.5}>
                <Text
                  className={wordmark.className}
                  fontStyle="italic"
                  fontWeight={600}
                  fontSize="34px"
                  color={colors.text}
                  lineHeight={1.1}
                >
                  {greeting}
                </Text>
                <Text color={colors.textMuted} fontSize="15px">
                  What's on your mind today?
                </Text>
              </VStack>
            </Flex>
          )}

          {messages.map((m) =>
            m.role === 'user' ? (
              <Flex key={m.id} justify="flex-end">
                <Box
                  maxW="78%"
                  bg={colors.surface}
                  color={colors.text}
                  px={5}
                  py={3.5}
                  borderRadius="18px"
                  border={"1px solid"}
                  borderColor={colors.elev}
                  fontSize="16px"
                  lineHeight="1.5"
                  css={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {m.content}
                </Box>
              </Flex>
            ) : (
              <HStack key={m.id} align="flex-start" gap={3}>
                <Box pt="2px">
                  <Orb
                    size={26}
                    state={
                      m.status === 'thinking'
                        ? 'thinking'
                        : m.status === 'streaming'
                        ? 'streaming'
                        : 'idle'
                    }
                  />
                </Box>
                <Text
                  color={m.error ? colors.textMuted : colors.text}
                  fontSize="16px"
                  lineHeight="1.6"
                  flex="1"
                  css={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {m.content}
                  {m.status === 'streaming' && (
                    <Box as="span" className="smsm-cursor" />
                  )}
                </Text>
              </HStack>
            )
          )}
          <Box ref={bottomRef} />
        </VStack>
      </Box>

      {/* Composer */}
      <Box
        as="footer"
        flexShrink={0}
        px={4}
        pt={3}
        pb="max(16px, env(safe-area-inset-bottom))"
        bg={colors.base}
      >
        <Box
          maxW="640px"
          mx="auto"
          bg={colors.surface}
          border={`1px solid ${colors.elev}`}
          borderRadius="28px"
          px={4}
          pt={3}
          pb={2}
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoGrow(e.target);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="smsm-textarea"
            variant="flushed"
            outline="none"
            border="none"
            color={colors.text}
            fontSize="16px"
            resize="none"
            rows={1}
            minH="24px"
            maxH="120px"
            overflowY="auto"
            px={0}
          />

          <HStack justify="space-between" mt={2}>
            <HStack gap={1}>
              <HStack
                gap={1.5}
                px={3}
                py={1.5}
                borderRadius="full"
                border={`1px solid ${colors.elev}`}
                color={colors.textMuted}
                fontSize="13px"
                cursor="pointer"
                _hover={{ bg: colors.hover }}
              >
                <Text>Smsm 2.0</Text>
              </HStack>
            </HStack>

            <HStack gap={1}>
              <IconButton
                aria-label="Send message"
                size="sm"
                borderRadius="full"
                bg={input.trim() ? colors.accent : colors.elev}
                color={input.trim() ? colors.base : colors.placeholder}
                disabled={!input.trim() || isBusy}
                onClick={handleSend}
                _hover={{ bg: input.trim() ? '#ffffff' : colors.elev }}
              >
                <ArrowUp size={18} />
              </IconButton>
            </HStack>
          </HStack>
        </Box>
      </Box>
    </Flex>
  );
};

export default ChatComponent;