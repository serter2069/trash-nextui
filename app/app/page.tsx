'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Card,
  CardBody,
  CardHeader,
  Button,
  Textarea,
  Divider,
} from '@heroui/react';

interface Thought {
  id: number;
  text: string;
  created_at: string;
}

export default function AppPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadThoughts = useCallback(async (p: number) => {
    setLoading(true);
    const res = await fetch(`/api/thoughts?page=${p}`);
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    setThoughts(data.thoughts);
    setTotal(data.total);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadThoughts(page);
  }, [page, loadThoughts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);

    const res = await fetch('/api/thoughts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (res.status === 401) {
      router.push('/login');
      return;
    }

    if (res.ok) {
      setText('');
      setPage(1);
      await loadThoughts(1);
    }
    setSubmitting(false);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const totalPages = Math.ceil(total / 20);

  const pluralThoughts = (n: number) => {
    if (n === 1) return 'мысль';
    if (n >= 2 && n <= 4) return 'мысли';
    return 'мыслей';
  };

  return (
    <div className="min-h-screen bg-default-50">
      <Navbar maxWidth="sm" className="bg-white shadow-sm">
        <NavbarBrand>
          <p className="font-bold text-inherit text-lg">Мысли в урну</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <Button variant="flat" size="sm" onPress={handleLogout}>
              Выйти
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Card shadow="sm">
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Textarea
                placeholder="Напишите негативную мысль..."
                value={text}
                onValueChange={setText}
                minRows={3}
                maxRows={8}
                variant="bordered"
              />
              <Button
                type="submit"
                color="primary"
                isLoading={submitting}
                isDisabled={!text.trim()}
                className="w-full"
              >
                {submitting ? 'Выбрасываем...' : 'Выбросить'}
              </Button>
            </form>
          </CardBody>
        </Card>

        <div>
          <h2 className="text-base font-semibold mb-3 text-default-700">
            История ({total} {pluralThoughts(total)})
          </h2>

          {loading ? (
            <p className="text-default-400 text-sm">Загрузка...</p>
          ) : thoughts.length === 0 ? (
            <p className="text-default-400 text-sm">Пока пусто. Выбросьте первую мысль.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {thoughts.map((t) => (
                <Card key={t.id} shadow="sm">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <span className="text-xs text-default-400">
                      {new Date(t.created_at).toLocaleString('ru-RU')}
                    </span>
                  </CardHeader>
                  <Divider />
                  <CardBody className="py-3 px-4">
                    <p className="text-sm whitespace-pre-wrap">{t.text}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="flat"
                size="sm"
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                isDisabled={page === 1}
              >
                Назад
              </Button>
              <span className="text-sm text-default-400">
                {page} / {totalPages}
              </span>
              <Button
                variant="flat"
                size="sm"
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                isDisabled={page === totalPages}
              >
                Вперёд
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
