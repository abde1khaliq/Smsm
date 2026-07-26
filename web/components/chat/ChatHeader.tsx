import { Flex, HStack, IconButton } from '@chakra-ui/react';
import { Menu, Plus } from 'lucide-react';
import { colors, Orb } from './Extras';

interface ChatHeaderProps {
  onNewChat: () => void;
}

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  return (
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
        onClick={onNewChat}
      >
        <Plus size={22} />
      </IconButton>
    </Flex>
  );
}
