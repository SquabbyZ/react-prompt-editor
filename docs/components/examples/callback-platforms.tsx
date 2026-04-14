import {
  Alert,
  Button,
  ConfigProvider,
  Input,
  message,
  Segmented,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import React, { useMemo, useState } from 'react';
import { PromptEditor } from '../../../src';
import '../../../src/styles/tailwind.css';
import type { OptimizeRequest, OptimizeResponse, TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

type DemoMode = 'mock' | 'live';
type Provider = 'openai' | 'dify' | 'bailian' | 'custom';

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  dify: 'Dify',
  bailian: '阿里百炼',
  custom: '自定义',
};

const PROVIDER_HINTS: Record<Provider, string> = {
  openai: '适合 OpenAI 兼容接口，优先解析 choices[0].delta.content。',
  dify: '适合 Dify 原始响应，优先解析 event=message 的 answer 字段。',
  bailian: '适合阿里百炼或兼容代理，优先尝试 output / text / content 字段。',
  custom: '适合你的自定义后端，优先尝试 optimizedContent / content / text / answer。',
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const getGenericText = (payload: any): string => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;

  return (
    payload.optimizedContent ||
    payload.content ||
    payload.text ||
    payload.answer ||
    payload.output?.text ||
    payload.output?.content ||
    payload.data?.text ||
    payload.data?.content ||
    payload.data?.answer ||
    ''
  );
};

const getStreamingChunk = (provider: Provider, payload: any): string => {
  if (!payload) return '';

  if (provider === 'openai') {
    return (
      payload.choices?.[0]?.delta?.content ||
      payload.choices?.[0]?.message?.content ||
      payload.delta ||
      getGenericText(payload)
    );
  }

  if (provider === 'dify') {
    if (
      payload.event === 'message' ||
      payload.event === 'agent_message' ||
      payload.event === 'text_chunk'
    ) {
      return payload.answer || payload.data?.answer || payload.chunk || '';
    }
    return getGenericText(payload);
  }

  if (provider === 'bailian') {
    return (
      payload.output?.text ||
      payload.output?.choices?.[0]?.message?.content ||
      payload.output?.choices?.[0]?.delta?.content ||
      payload.text ||
      getGenericText(payload)
    );
  }

  return getGenericText(payload);
};

const isStreamDone = (provider: Provider, payload: any): boolean => {
  if (!payload) return false;
  if (payload.done === true) return true;

  if (provider === 'openai') {
    return payload.choices?.[0]?.finish_reason === 'stop';
  }

  if (provider === 'dify') {
    return (
      payload.event === 'message_end' ||
      payload.event === 'workflow_finished' ||
      payload.event === 'agent_message_end'
    );
  }

  if (provider === 'bailian') {
    return (
      payload.output?.finish_reason === 'stop' ||
      payload.finish_reason === 'stop'
    );
  }

  return false;
};

const getFinalText = (provider: Provider, payload: any): string => {
  if (!payload) return '';

  if (provider === 'openai') {
    return payload.choices?.[0]?.message?.content || getGenericText(payload);
  }

  if (provider === 'dify') {
    return payload.answer || payload.data?.answer || getGenericText(payload);
  }

  if (provider === 'bailian') {
    return payload.output?.text || getGenericText(payload);
  }

  return getGenericText(payload);
};

const buildPayload = (
  provider: Provider,
  request: OptimizeRequest,
  model: string,
  stream: boolean,
) => ({
  provider,
  model,
  stream,
  messages: request.messages || [],
  content: request.content,
  selectedText: request.selectedText,
  instruction: request.instruction,
});

const createCodeTemplate = (provider: Provider, stream: boolean) => `const handleOptimizeRequest = async (request, callbacks) => {
  try {
    const response = await fetch('/api/ai-adapter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer YOUR_API_KEY',
      },
      signal: request.signal,
      body: JSON.stringify({
        provider: '${provider}',
        model: 'YOUR_MODEL',
        stream: ${stream},
        messages: request.messages,
        content: request.content,
        selectedText: request.selectedText,
      }),
    });

    if (!response.ok) {
      throw new Error(\`请求失败: \${response.status}\`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/event-stream')) {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      if (!reader) throw new Error('响应流不可用');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === '[DONE]') continue;

          const json = JSON.parse(raw);
          const chunk = ${
            provider === 'openai'
              ? "json.choices?.[0]?.delta?.content || json.delta || ''"
              : provider === 'dify'
                ? "(json.event === 'message' ? json.answer : '') || json.answer || ''"
                : provider === 'bailian'
                  ? "json.output?.text || json.text || json.content || ''"
                  : "json.optimizedContent || json.content || json.text || json.answer || ''"
          };

          if (chunk) {
            fullText += chunk;
            callbacks.onResponse({
              optimizedContent: fullText,
              thinkingProcess: '正在生成...',
            });
          }
        }
      }

      callbacks.onResponse({
        optimizedContent: fullText,
        done: true,
      });
      return;
    }

    const data = await response.json();
    callbacks.onResponse({
      optimizedContent: ${
        provider === 'openai'
          ? "data.choices?.[0]?.message?.content || data.content || ''"
          : provider === 'dify'
            ? "data.answer || data.data?.answer || data.content || ''"
            : provider === 'bailian'
              ? "data.output?.text || data.text || data.content || ''"
              : "data.optimizedContent || data.content || data.text || data.answer || ''"
      },
      done: true,
    });
  } catch (error) {
    if (error?.name === 'AbortError') return;
    callbacks.onError(error);
  }
};`;

export default function CallbackPlatformsDemo() {
  const [demoMode, setDemoMode] = useState<DemoMode>('mock');
  const [provider, setProvider] = useState<Provider>('openai');
  const [apiUrl, setApiUrl] = useState('/api/ai-adapter');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [stream, setStream] = useState(true);

  const [value, setValue] = useState<TaskNode[]>([
    {
      id: '1',
      title: '多平台回调模式演示',
      content:
        '# 多平台回调模式演示\n\n请把这段 Prompt 优化得更清晰、更适合交给模型执行。\n\n## 目标\n\n- 保留原始意图\n- 提高结构化程度\n- 适配不同平台的接入方式',
      children: [],
      isLocked: false,
      hasRun: false,
      dependencies: [],
    },
  ]);

  const payloadPreview = useMemo(
    () =>
      JSON.stringify(
        buildPayload(
          provider,
          {
            content: value[0]?.content || '',
            selectedText: value[0]?.content,
            messages: [
              {
                role: 'system',
                content: '你是一个 Prompt 优化助手。',
              },
              {
                role: 'user',
                content: value[0]?.content || '',
              },
            ],
          },
          model,
          stream,
        ),
        null,
        2,
      ),
    [model, provider, stream, value],
  );

  const codeTemplate = useMemo(
    () => createCodeTemplate(provider, stream),
    [provider, stream],
  );

  const copyCodeTemplate = async () => {
    try {
      await navigator.clipboard.writeText(codeTemplate);
      message.success('实战版代码已复制，可以直接粘贴到你的项目中');
    } catch {
      message.error('复制失败，请手动复制下方代码');
    }
  };

  const runMockOptimize = async (
    request: OptimizeRequest,
    callbacks: {
      onResponse: (response: OptimizeResponse) => void;
      onError: (error: Error) => void;
    },
  ) => {
    try {
      const sourceText = request.selectedText || request.content;
      const headline = `已切换为 ${PROVIDER_LABELS[provider]} 的回调模式`;
      const body =
        provider === 'dify'
          ? '这个示例模拟了 Dify 风格的分段返回，重点是让你看到 answer 字段最终如何汇总。'
          : provider === 'bailian'
            ? '这个示例模拟了百炼或代理层的文本返回，重点是将平台差异统一映射成 optimizedContent。'
            : provider === 'custom'
              ? '这个示例模拟你的自定义后端，只要最终能映射成 optimizedContent，就能顺利接入组件。'
              : '这个示例模拟了 OpenAI 兼容流式输出，重点是多次 onResponse 与最终 done 的配合。';

      const finalText = `# ${headline}\n\n${body}\n\n## 优化建议\n\n- 保留原始意图\n- 明确执行目标\n- 输出结构更适合多平台接入\n\n## 当前内容摘要\n\n${sourceText.slice(0, 120)}${sourceText.length > 120 ? '...' : ''}`;

      const chunks = finalText.match(/.{1,24}/g) || [];
      let accumulated = '';

      for (const chunk of chunks) {
        if (request.signal?.aborted) {
          return;
        }

        accumulated += chunk;
        callbacks.onResponse({
          optimizedContent: accumulated,
          thinkingProcess: `Mock 正在模拟 ${PROVIDER_LABELS[provider]} 的流式返回...`,
        });
        await sleep(80);
      }

      callbacks.onResponse({
        optimizedContent: accumulated,
        thinkingProcess: 'Mock 演示完成，现在可以切到“真实接入（实战）”测试你的接口。',
        done: true,
      });
    } catch (error) {
      callbacks.onError(error as Error);
    }
  };

  const runLiveOptimize = async (
    request: OptimizeRequest,
    callbacks: {
      onResponse: (response: OptimizeResponse) => void;
      onError: (error: Error) => void;
    },
  ) => {
    if (!apiUrl.trim()) {
      message.warning('请先填写 API URL，再测试真实接口');
      callbacks.onError(new Error('缺少 API URL'));
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey.trim() ? { Authorization: `Bearer ${apiKey.trim()}` } : {}),
        },
        signal: request.signal,
        body: JSON.stringify(buildPayload(provider, request, model, stream)),
      });

      if (!response.ok) {
        throw new Error(`请求失败：${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const shouldTreatAsStream =
        stream || contentType.includes('text/event-stream');

      if (shouldTreatAsStream) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        if (!reader) {
          throw new Error('当前响应不可读，请确认你的接口是否真的返回流');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const raw = trimmed.startsWith('data:')
              ? trimmed.slice(5).trim()
              : trimmed;

            if (!raw || raw === '[DONE]') continue;

            try {
              const payload = JSON.parse(raw);
              const chunk = getStreamingChunk(provider, payload);

              if (chunk) {
                fullText += chunk;
                callbacks.onResponse({
                  optimizedContent: fullText,
                  thinkingProcess: `正在解析 ${PROVIDER_LABELS[provider]} 的流式响应...`,
                });
              }

              if (isStreamDone(provider, payload)) {
                callbacks.onResponse({
                  optimizedContent: fullText,
                  done: true,
                });
                return;
              }
            } catch {
              // 兼容非 JSON 的碎片文本流
              fullText += raw;
              callbacks.onResponse({
                optimizedContent: fullText,
                thinkingProcess: '收到非标准文本分片，已按原文拼接。',
              });
            }
          }
        }

        if (!fullText) {
          throw new Error(
            `没有从 ${PROVIDER_LABELS[provider]} 响应中解析到内容，请检查字段映射`,
          );
        }

        callbacks.onResponse({
          optimizedContent: fullText,
          done: true,
        });
        return;
      }

      const payload = await response.json();
      const finalText = getFinalText(provider, payload);

      if (!finalText) {
        throw new Error(
          `没有从 ${PROVIDER_LABELS[provider]} 的非流式响应中解析到内容，请检查返回字段`,
        );
      }

      callbacks.onResponse({
        optimizedContent: finalText,
        thinkingProcess: '已完成一次非流式解析。',
        done: true,
      });
      message.success('真实接口测试成功，可以直接复制下方实战版代码');
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return;
      }

      callbacks.onError(
        error instanceof Error ? error : new Error('真实接口调用失败'),
      );
    }
  };

  const handleOptimizeRequest = (
    request: OptimizeRequest,
    callbacks: {
      onResponse: (response: OptimizeResponse) => void;
      onError: (error: Error) => void;
    },
  ) => {
    if (demoMode === 'mock') {
      return runMockOptimize(request, callbacks);
    }

    return runLiveOptimize(request, callbacks);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
        },
      }}
    >
      <DemoWrapper height="920px" title="Callback Platforms Demo">
        <div className="flex h-full flex-col">
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Alert
                type="info"
                showIcon
                message="推荐使用顺序：先用 Mock 熟悉回调协议，再切到真实接口测试；测试通过后，直接复制下方实战版代码。"
              />

              <div className="flex flex-wrap items-center gap-3">
                <Tag color="blue">1. 先体验 Mock</Tag>
                <Tag color="purple">2. 再测真实接口</Tag>
                <Tag color="gold">3. 最后复制代码</Tag>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Segmented<DemoMode>
                  value={demoMode}
                  onChange={(value) => setDemoMode(value)}
                  options={[
                    { label: '快速体验（Mock）', value: 'mock' },
                    { label: '真实接入（实战）', value: 'live' },
                  ]}
                />

                <Select<Provider>
                  value={provider}
                  onChange={setProvider}
                  style={{ width: 160 }}
                  options={Object.entries(PROVIDER_LABELS).map(([value, label]) => ({
                    value: value as Provider,
                    label,
                  }))}
                />

                <Switch
                  checked={stream}
                  onChange={setStream}
                  checkedChildren="流式"
                  unCheckedChildren="非流式"
                />
              </div>

              <Typography.Paragraph className="!mb-0 !text-sm !text-zinc-600 dark:!text-zinc-400">
                <strong>{PROVIDER_LABELS[provider]}：</strong>
                {PROVIDER_HINTS[provider]}
              </Typography.Paragraph>

              {demoMode === 'live' ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
                  <Input
                    placeholder="API URL，例如 /api/ai-adapter"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                  <Input
                    placeholder="API Key（可选）"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Input
                    placeholder="Model（例如 gpt-4o-mini）"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                  <Button onClick={copyCodeTemplate}>复制实战代码</Button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-indigo-300/70 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-700">
                  当前为 Mock 模式：无需接口、无需 Key，直接点击 AI 优化即可看到多次
                  `onResponse` 与最终 `done: true` 的完整流程。
                </div>
              )}
            </Space>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-zinc-200 md:grid-cols-[1.2fr_0.8fr] md:divide-x md:divide-y-0 dark:divide-zinc-800">
            <div className="min-h-0">
              <PromptEditor
                value={value}
                onChange={setValue}
                onOptimizeRequest={handleOptimizeRequest}
                onLike={() => message.info('触发了点赞回调')}
                onDislike={() => message.info('触发了点踩回调')}
              />
            </div>

            <div className="min-h-0 overflow-auto bg-[#fbfcff] p-4 dark:bg-zinc-950">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      当前请求示意
                    </Typography.Title>
                    <Tag color={demoMode === 'mock' ? 'blue' : 'green'}>
                      {demoMode === 'mock' ? 'Mock' : 'Live'}
                    </Tag>
                  </div>
                  <pre className="overflow-auto rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-6 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                    {payloadPreview}
                  </pre>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      可复制的实战版代码
                    </Typography.Title>
                    <Button type="link" size="small" onClick={copyCodeTemplate}>
                      复制
                    </Button>
                  </div>
                  <pre className="overflow-auto rounded-xl border border-zinc-200 bg-[#0b1020] p-3 text-xs leading-6 text-zinc-100 dark:border-zinc-800">
                    {codeTemplate}
                  </pre>
                </div>
              </Space>
            </div>
          </div>
        </div>
      </DemoWrapper>
    </ConfigProvider>
  );
}
