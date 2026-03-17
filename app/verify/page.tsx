'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardBody, Input, Button } from '@heroui/react';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (res.ok) {
      router.push('/app');
    } else {
      const data = await res.json();
      setError(data.error || 'Неверный код');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-default-50">
      <Card className="w-full max-w-sm" shadow="md">
        <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-2">
          <h1 className="text-2xl font-bold">Введите код</h1>
          <p className="text-default-500 text-sm">
            Код отправлен на {email}. Подсказка: всегда <strong>1234</strong>
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="code-input"
              type="text"
              label="4-значный код"
              placeholder="1234"
              maxLength={4}
              value={code}
              onValueChange={setCode}
              isRequired
              variant="bordered"
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button
              id="verify-btn"
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full"
            >
              {loading ? 'Проверяем...' : 'Войти'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
