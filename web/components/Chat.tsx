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
import {
  ArrowUp,
  Check,
  Copy,
  Menu,
  MoreHorizontal,
  Plus,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { colors, getGreeting, inter, Message, Orb, wordmark } from './utils/Extras';

// A streamed-in chunk of assistant text. Each one gets its own glow-on-arrival
// animation, matching the mid-stream highlight in the reference mockup.
interface Chunk {
  id: string;
  text: string;
}

// Extends whatever `Message` already looks like in Extras, without needing to
// touch that file — these are all rendering/interaction concerns local to
// this component: chunks for the glow animation, replyToText so a message
// can be regenerated, liked for the thumbs up/down toggle.
type ChatMessage = Message & {
  chunks?: Chunk[];
  replyToText?: string;
  liked?: 'up' | 'down';
};

// Three staggered pulsing dots + label, replacing the message body while
// waiting on the first token — matches the "01 · Thinking" reference frame.
function ThinkingDots() {
  return (
    <HStack gap="4px">
      <Box className="smsm-dot" />
      <Box className="smsm-dot" style={{ animationDelay: '0.15s' }} />
      <Box className="smsm-dot" style={{ animationDelay: '0.3s' }} />
    </HStack>
  );
}

const ChatComponent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [greeting, setGreeting] = useState('Hello');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Drives a single streamed reply into the message with id `replyId`.
  // Shared by both handleSend (new message) and handleRegenerate (rerun).
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

  const handleRegenerate = async (messageId: string) => {
    if (isBusy) return;
    const target = messages.find((m) => m.id === messageId);
    if (!target?.replyToText) return;
    await streamReply(messageId, target.replyToText);
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — not worth surfacing.
    }
  };

  const handleFeedback = (id: string, value: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, liked: m.liked === value ? undefined : value } : m
      )
    );
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
        /* ---- streaming cursor: 1px hard-blink, matches steps(2) 0.9s spec ---- */
        @keyframes smsm-blink {
          to { opacity: 0; }
        }
        .smsm-cursor {
          display: inline-block;
          width: 1px;
          height: 1em;
          background: ${colors.accent};
          vertical-align: -0.15em;
          margin-left: 1px;
          animation: smsm-blink 0.9s steps(2) infinite;
        }
        .smsm-textarea::placeholder {
          color: ${colors.placeholder};
        }

        /* ---- per-chunk glow: each streamed piece of text highlights on
           arrival, then fades to plain — the animated version of the static
           mid-stream highlight in the reference frame ---- */
        .smsm-chunk {
          display: inline;
          padding: 0 1px;
          margin: 0 -1px;
          border-radius: 3px;
          animation: smsm-chunk-glow 900ms ease-out forwards;
        }
        @keyframes smsm-chunk-glow {
          0% { background: rgba(245, 241, 232, 0.28); }
          100% { background: rgba(245, 241, 232, 0); }
        }

        /* ---- thinking dots: staggered pulse, paired with the orb's ring ---- */
        .smsm-dot {
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          background: ${colors.accent};
          animation: smsm-dot-bounce 1s ease-in-out infinite;
        }
        @keyframes smsm-dot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-3px); opacity: 1; }
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
          .smsm-orb-shine,
          .smsm-dot,
          .smsm-chunk,
          .smsm-cursor {
            animation: none !important;
          }
          .smsm-chunk {
            background: transparent !important;
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
                  border={'1px solid'}
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

                {m.status === 'thinking' ? (
                  <HStack gap={2} pt="4px">
                    <ThinkingDots />
                    <Text color={colors.textMuted} fontSize="14px">
                      Smsm is thinking…
                    </Text>
                  </HStack>
                ) : (
                  <Text
                    color={m.error ? colors.textMuted : colors.text}
                    fontSize="16px"
                    lineHeight="1.6"
                    flex="1"
                    css={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {m.status === 'streaming' && m.chunks
                      ? m.chunks.map((c) => (
                          <Box as="span" key={c.id} className="smsm-chunk">
                            {c.text}
                          </Box>
                        ))
                      : m.content}
                    {m.status === 'streaming' && (
                      <Box as="span" className="smsm-cursor" />
                    )}
                  </Text>
                )}
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