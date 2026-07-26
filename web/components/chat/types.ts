import { Message } from './Extras';

export interface Chunk {
  id: string;
  text: string;
}

export type ChatMessage = Message & {
  chunks?: Chunk[];
  replyToText?: string;
  liked?: 'up' | 'down';
};
