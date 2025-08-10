import { describe, it, expect, vi, beforeEach } from 'vitest';

const answers = vi.hoisted(() => ({ queue: [] }));

vi.mock('readline', () => ({
  default: {
    createInterface: () => ({
      question: (q, cb) => { const a = answers.queue.shift() ?? ''; cb(a); },
      close: () => {}
    })
  }
}));

describe('ui/userPrompts', () => {
  beforeEach(() => {
    vi.resetModules();
    answers.queue = [];
  });

  it('selects sporting event by menu', async () => {
    answers.queue = ['1'];
    const { userPrompts } = await import('../src/ui/userPrompts.js');
    const result = await userPrompts.selectContentType();
    expect(result).toMatch(/sporting event/i);
  });

  it('selects black & white movie by menu', async () => {
    answers.queue = ['2'];
    const { userPrompts } = await import('../src/ui/userPrompts.js');
    const result = await userPrompts.selectContentType();
    expect(result).toMatch(/black and white|black & white/i);
  });

  it('handles custom description', async () => {
    answers.queue = ['3', 'my custom'];
    const { userPrompts } = await import('../src/ui/userPrompts.js');
    const result = await userPrompts.selectContentType();
    expect(result).toBe('my custom');
  });

  it('defaults to sporting event when custom empty', async () => {
    answers.queue = ['3', '   '];
    const { userPrompts } = await import('../src/ui/userPrompts.js');
    const result = await userPrompts.selectContentType();
    expect(result).toMatch(/sporting event/i);
  });

  it('falls back to sporting event on invalid selection', async () => {
    answers.queue = ['9'];
    const { userPrompts } = await import('../src/ui/userPrompts.js');
    const result = await userPrompts.selectContentType();
    expect(result).toMatch(/sporting event/i);
  });
});
