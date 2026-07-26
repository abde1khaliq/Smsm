import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import { colors, Orb } from './Extras';
import { ChatMessage } from './types';
import { ThinkingDots } from './ThinkingDots';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message: m }: ChatMessageItemProps) {
  if (m.role === 'user') {
    return (
      <Flex justify="flex-end">
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
    );
  }

  return (
    <HStack align="flex-start" gap={3}>
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
  );
}
