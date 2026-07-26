import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { RefObject } from 'react';
import { colors, Orb, wordmark } from './Extras';
import { ChatMessage } from './types';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatMessagesProps {
  messages: ChatMessage[];
  greeting: string;
  bottomRef: RefObject<HTMLDivElement | null>;
}

export function ChatMessages({ messages, greeting, bottomRef }: ChatMessagesProps) {
  return (
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

        {messages.map((m) => (
          <ChatMessageItem key={m.id} message={m} />
        ))}
        <Box ref={bottomRef as any} />
      </VStack>
    </Box>
  );
}
