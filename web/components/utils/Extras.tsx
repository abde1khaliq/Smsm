import { Box } from "@chakra-ui/react";
import { Inter, Playfair_Display } from "next/font/google";

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const wordmark = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['600'],
});

export const colors = {
  base: '#0A0A0B',
  surface: '#131315',
  elev: '#1B1B1E',
  accent: '#F5F1E8',
  text: '#F5F1E8',
  textMuted: 'rgba(245, 241, 232, 0.55)',
  placeholder: 'rgba(245, 241, 232, 0.35)',
  hairline: 'rgba(245, 241, 232, 0.08)',
  hover: 'rgba(245, 241, 232, 0.06)',
};

export type Role = 'user' | 'assistant';
export type MessageStatus = 'thinking' | 'streaming' | undefined;

export interface Message {
  id: string;
  role: Role;
  content: string;
  status?: MessageStatus;
  error?: boolean;
}

export function getGreeting(hour: number): string {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Orb({
  size = 12,
  state = 'idle',
}: {
  size?: number;
  state?: 'idle' | 'thinking' | 'streaming';
}) {
  const stateClass =
    state === 'thinking'
      ? ' smsm-orb-thinking'
      : state === 'streaming'
      ? ' smsm-orb-active'
      : '';

  return (
    <Box
      position="relative"
      flexShrink={0}
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="full"
      className={`smsm-orb${stateClass}`}
    >
      <Box className="smsm-orb-shine" />
    </Box>
  );
}