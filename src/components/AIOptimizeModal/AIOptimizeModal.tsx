import {
  CloseOutlined,
  CopyOutlined,
  DislikeOutlined,
  FileTextOutlined,
  LikeOutlined,
  MessageOutlined,
  ReloadOutlined,
  SendOutlined,
  StopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import { OptimizeRequest, OptimizeResponse } from '../../types';

interface AIOptimizeModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 原始内容 */
  originalContent: string;
  /** 选中的内容（如果有） */
  selectedContent?: string;
  /** AI 优化 API */
  optimizeAPI?: (req: OptimizeRequest) => Promise<OptimizeResponse>;
  /** 应用优化结果回调 */
  onApply: (optimizedContent: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const AIOptimizeModal: React.FC<AIOptimizeModalProps> = ({
  open,
  onClose,
  originalContent,
  selectedContent,
  optimizeAPI,
  onApply,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
      }
    };
  }, []);

  // 模拟流式输出
  const simulateStreaming = (fullText: string) => {
    let index = 0;
    const chunkSize = 3;
    const interval = 20;

    const timer = setInterval(() => {
      if (index >= fullText.length) {
        clearInterval(timer);
        streamTimerRef.current = null;
        setCurrentResponse('');
        const assistantMessage: ChatMessage = {
          id: uuidv4(), // 使用 UUID v4 确保消息 ID 唯一性
          role: 'assistant',
          content: fullText,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsStreaming(false);
        setIsGenerating(false);
        return;
      }
      const chunk = fullText.slice(index, index + chunkSize);
      setCurrentResponse((prev) => prev + chunk);
      index += chunkSize;
    }, interval);

    streamTimerRef.current = timer;
  };

  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }

    if (currentResponse) {
      const assistantMessage: ChatMessage = {
        id: uuidv4(), // 使用 UUID v4 确保消息 ID 唯一性
        role: 'assistant',
        content: currentResponse,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentResponse('');
    }

    setIsStreaming(false);
    setIsGenerating(false);
  };

  const handleSendMessageFromContent = async (content: string) => {
    if (!optimizeAPI) return;

    try {
      abortControllerRef.current = new AbortController();

      const conversationHistory = messages
        .map((msg) => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`)
        .join('\n\n');

      const response = await optimizeAPI({
        content: originalContent,
        instruction: `${conversationHistory}\n\n用户: ${content}`,
      });

      const fullText = response.optimizedContent || '';
      simulateStreaming(fullText);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Regenerate failed:', error);
        message.error('重新生成失败，请重试');
      }
      setIsGenerating(false);
      setIsStreaming(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('已复制到剪贴板');
  };

  const handleRegenerate = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((msg) => msg.role === 'user');

      if (lastUserMessage) {
        // 移除最后一条 AI 回复
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages
            .map((msg, idx) => ({ msg, idx }))
            .reverse()
            .find((item) => item.msg.role === 'assistant')?.idx;

          if (lastIndex !== undefined) {
            newMessages.splice(lastIndex, 1);
          }
          return newMessages;
        });

        setIsGenerating(true);
        setIsStreaming(true);
        setCurrentResponse('');

        // 重新发送最后一条用户消息
        setTimeout(() => {
          handleSendMessageFromContent(lastUserMessage.content);
        }, 100);
      }
    }
  };

  const handleClose = () => {
    handleStopResponse();
    setMessages([]);
    setCurrentResponse('');
    setInputValue('');
    onClose();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: uuidv4(), // 使用 UUID v4 确保消息 ID 唯一性
      role: 'user',
      content: selectedContent
        ? `请输入优化指令：\n\n${inputValue.trim()}\n\n选中的内容：\n\n${selectedContent}`
        : inputValue.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setIsGenerating(true);
    setIsStreaming(true);
    setCurrentResponse('');

    await handleSendMessageFromContent(userMessage.content);
  };

  const handleApply = () => {
    // 获取最新的 AI 回复内容
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'assistant');

    if (lastAssistantMessage?.content) {
      onApply(lastAssistantMessage.content);
      message.success('优化内容已应用');
      handleClose();
    } else {
      message.warning('暂无优化内容可应用');
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  // 弹窗打开时，不自动发送请求，等待用户输入

  const renderMessageContent = (content: string) => {
    // 简单的 Markdown 渲染
    return (
      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
        {content.split('\n').map((line, index) => {
          // 处理标题
          if (line.startsWith('### ')) {
            return (
              <h3
                key={index}
                className="mb-2 mt-4 text-base font-semibold text-teal-600"
              >
                {line.slice(4)}
              </h3>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2
                key={index}
                className="mb-2 mt-4 text-lg font-semibold text-teal-600"
              >
                {line.slice(3)}
              </h2>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h1
                key={index}
                className="mb-2 mt-4 text-xl font-bold text-teal-600"
              >
                {line.slice(2)}
              </h1>
            );
          }

          // 处理列表
          if (line.match(/^\d+\.\s/)) {
            return (
              <div key={index} className="mb-1 ml-4">
                <span className="font-medium text-gray-900">{line}</span>
              </div>
            );
          }

          // 处理加粗文本
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={index} className="mb-1">
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong
                      key={partIndex}
                      className="font-semibold text-gray-900"
                    >
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={partIndex}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] transition-opacity ${
        open
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      }`}
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 弹窗内容 */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center p-4 pt-20">
        <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* 顶部操作栏 */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <ThunderboltOutlined className="text-xl text-indigo-500" />
              <span className="text-lg font-semibold text-gray-900">
                AI 提示词优化
              </span>
              {selectedContent && (
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                  已选中 {selectedContent.length} 字
                </span>
              )}
            </div>
            <Button
              type="text"
              size="large"
              icon={<CloseOutlined className="text-lg" />}
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            />
          </div>

          {/* 消息列表 */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-6 py-4">
            {/* 如果有选中的内容，显示在顶部作为参考 */}
            {selectedContent && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                <div className="mb-2 flex items-center gap-1 text-xs font-medium text-indigo-600">
                  <FileTextOutlined />
                  选中的内容（{selectedContent.length} 字）
                </div>
                <div className="max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700">
                  {selectedContent}
                </div>
              </div>
            )}

            {messages.length === 0 && !isGenerating && !selectedContent && (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <MessageOutlined className="mb-3 text-5xl opacity-30" />
                <p className="text-sm">输入优化指令，AI 将为您优化提示词</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="space-y-3">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {renderMessageContent(msg.content)}
                      </div>

                      {/* 消息操作按钮 */}
                      <div className="flex items-center gap-1 border-t border-gray-100 pt-3">
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopy(msg.content)}
                          className="text-gray-500 hover:text-indigo-500"
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={handleRegenerate}
                          className="text-gray-500 hover:text-indigo-500"
                        />
                        <div className="flex-1" />
                        <Button
                          type="text"
                          size="small"
                          icon={<LikeOutlined />}
                          className="text-gray-500 hover:text-green-500"
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<DislikeOutlined />}
                          className="text-gray-500 hover:text-red-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm">
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 当前流式输出 */}
            {currentResponse && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-white px-5 py-3 text-gray-900 shadow-sm">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {renderMessageContent(currentResponse)}
                  </div>
                  <span className="mt-1 inline-block h-4 w-2 animate-pulse bg-indigo-500" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 底部操作区 */}
          <div className="flex-shrink-0 space-y-3 border-t border-gray-200 bg-white px-6 py-4">
            {/* 操作按钮 */}
            {!isGenerating && messages.length > 0 && (
              <div className="flex items-center justify-start gap-3">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleApply}
                  className="border-none bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  替换
                </Button>
                <Button size="large" onClick={handleClose}>
                  退出
                </Button>
              </div>
            )}

            {/* 输入框 */}
            <div className="relative flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 transition-all focus-within:border-purple-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-purple-100/50 hover:border-purple-300 hover:bg-white">
              <ThunderboltOutlined className="flex-shrink-0 text-lg text-purple-400" />
              <Input.TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (isStreaming) {
                      handleStopResponse();
                    } else if (inputValue.trim()) {
                      handleSendMessage();
                    }
                  }
                }}
                placeholder={
                  selectedContent
                    ? `请输入优化指令（已选中 ${selectedContent.length} 字内容）`
                    : '请输入优化指令...'
                }
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="resize-none border-none bg-transparent p-0 text-sm focus:shadow-none"
                disabled={isGenerating && isStreaming}
              />
              {isStreaming ? (
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<StopOutlined />}
                  onClick={handleStopResponse}
                  className="flex-shrink-0"
                >
                  停止
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isGenerating}
                  className="flex-shrink-0 border-none bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                />
              )}
            </div>

            {/* 免责声明 */}
            <p className="text-center text-xs text-gray-400">
              内容由AI生成，无法确保真实准确，仅供参考。
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
