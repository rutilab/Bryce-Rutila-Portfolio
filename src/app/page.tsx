'use client';

import { ChatContainer } from '@/components/chat';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-24 pb-8">
      <div className="w-full max-w-3xl">
        <ChatContainer />
      </div>
    </main>
  );
}
