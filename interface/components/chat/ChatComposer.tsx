import { Box, HStack, IconButton, Text, Textarea } from '@chakra-ui/react';
import { RefObject } from 'react';
import { ArrowUp } from 'lucide-react';
import { colors } from './Extras';

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  isBusy: boolean;
  onSend: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export function ChatComposer({
  input,
  setInput,
  isBusy,
  onSend,
  textareaRef,
}: ChatComposerProps) {
  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
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
          ref={textareaRef as any}
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
              onClick={onSend}
              _hover={{ bg: input.trim() ? '#ffffff' : colors.elev }}
            >
              <ArrowUp size={18} />
            </IconButton>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
}
