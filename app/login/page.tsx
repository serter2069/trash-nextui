'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Input, Button } from '@heroui/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Что-то пошло не так');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-default-50">
      <Card className="w-full max-w-sm" shadow="md">
        <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-2">
          <h1 className="text-2xl font-bold">Мысли в урну</h1>
          <p className="text-default-500 text-sm">Введите email для входа</p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email-input"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onValueChange={setEmail}
              isRequired
              variant="bordered"
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button
              id="send-btn"
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full"
            >
              {loading ? 'Отправляем...' : 'Получить код'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
