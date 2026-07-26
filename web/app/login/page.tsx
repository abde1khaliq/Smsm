'use client';

import { Box, Button, Flex, Input, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { colors, inter, wordmark, Orb } from '../../components/chat/Extras';
import { ChatStyles } from '../../components/chat/ChatStyles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Implement login logic here
    console.log('Login attempt:', { email, password });
  };

  return (
    <Flex
      direction="column"
      h="100dvh"
      bg={colors.base}
      align="center"
      justify="center"
      className={inter.className}
      px={4}
    >
      <ChatStyles />
      <Box
        w="100%"
        maxW="400px"
        bg={colors.surface}
        border={`1px solid ${colors.elev}`}
        borderRadius="28px"
        p={8}
        boxShadow="0 10px 40px rgba(0, 0, 0, 0.5)"
      >
        <VStack gap={6} align="stretch">
          <VStack gap={3} align="center" mb={2}>
            <Orb size={48} />
            <Text
              className={wordmark.className}
              fontStyle="italic"
              fontWeight={600}
              fontSize="34px"
              color={colors.text}
              lineHeight={1.1}
              textAlign="center"
              mt={2}
            >
              Welcome back
            </Text>
            <Text color={colors.textMuted} fontSize="15px" textAlign="center">
              Sign in to continue using Smsm
            </Text>
          </VStack>

          <VStack gap={4}>
            <Input
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="flushed"
              bg={colors.base}
              border={`1px solid ${colors.elev}`}
              _hover={{ borderColor: 'rgba(245, 241, 232, 0.2)' }}
              _focus={{ borderColor: colors.accent, bg: colors.surface }}
              color={colors.text}
              _placeholder={{ color: colors.placeholder }}
              px={4}
              h="52px"
              borderRadius="16px"
              fontSize="15px"
              transition="all 0.2s"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="flushed"
              bg={colors.base}
              border={`1px solid ${colors.elev}`}
              _hover={{ borderColor: 'rgba(245, 241, 232, 0.2)' }}
              _focus={{ borderColor: colors.accent, bg: colors.surface }}
              color={colors.text}
              _placeholder={{ color: colors.placeholder }}
              px={4}
              h="52px"
              borderRadius="16px"
              fontSize="15px"
              transition="all 0.2s"
            />
          </VStack>

          <Button
            onClick={handleLogin}
            bg={colors.accent}
            color={colors.base}
            _hover={{ bg: '#ffffff', transform: 'translateY(-1px)' }}
            _active={{ bg: '#e0dcd3', transform: 'translateY(0)' }}
            h="52px"
            borderRadius="16px"
            fontSize="16px"
            fontWeight={600}
            mt={2}
            transition="all 0.2s"
          >
            Sign in
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
