import { Box, HStack } from '@chakra-ui/react';

export function ThinkingDots() {
  return (
    <HStack gap="4px">
      <Box className="smsm-dot" />
      <Box className="smsm-dot" style={{ animationDelay: '0.15s' }} />
      <Box className="smsm-dot" style={{ animationDelay: '0.3s' }} />
    </HStack>
  );
}
