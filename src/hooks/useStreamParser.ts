import { useCallback, useRef } from 'react';

/**
 * 智能流式解析器 Hook
 * 负责处理 SSE 数据流的解析、多协议适配及容错处理
 */
export function useStreamParser() {
  const errorCountRef = useRef(0);
  const MAX_PARSE_ERRORS = 3; // 连续解析错误阈值，超过则终止

  /**
   * 从 JSON 对象中提取文本内容 (支持 OpenAI, Dify, 阿里百炼, 通用格式)
   */
  const extractContent = useCallback((json: any, platform: string): string | null => {
    try {
      // 1. Dify 适配
      if (platform === 'dify' || (platform === 'auto' && json.event !== undefined)) {
        if (json.event === 'message' && json.answer) return json.answer;
        if (json.event === 'error') throw new Error(json.message || 'Dify 接口返回错误');
        return null;
      }

      // 2. 阿里百炼适配
      if (platform === 'bailian' || (platform === 'auto' && json.usage !== undefined)) {
        // 百炼格式：{ text: "...", finish_reason: "null"|"stop", usage: {...} }
        if (json.text) return json.text;
        // 检查结束标志（注意：百炼的 finish_reason 是字符串 "null" 或 "stop"）
        if (json.finish_reason === 'stop') return null;
        return null;
      }

      // 3. OpenAI 适配
      if (platform === 'openai' || platform === 'auto') {
        const content = json.choices?.[0]?.delta?.content;
        if (content) return content;
        // 检查是否有 finish_reason 且无内容，视为正常结束
        // 注意：只判断真正的 truthy 值，排除 "null" 字符串
        if (json.choices?.[0]?.finish_reason && json.choices[0].finish_reason !== 'null') {
          return null;
        }
      }

      // 4. 通用兜底
      return json.content || json.text || json.response || json.output || null;
    } catch (e) {
      console.warn('Content extraction failed:', e);
      return null;
    }
  }, []);

  /**
   * 解析单行 SSE 数据
   * @returns { text: 提取的文本片段, isDone: 是否结束, error: 错误信息 }
   */
  const parseLine = useCallback((line: string, platform: string): { 
    text?: string; 
    isDone?: boolean; 
    error?: string 
  } => {
    if (!line.startsWith('data: ')) return {};

    const rawData = line.slice(6).trim();
    if (rawData === '[DONE]') return { isDone: true };

    try {
      const json = JSON.parse(rawData);
      const text = extractContent(json, platform);
      errorCountRef.current = 0; // 解析成功，重置错误计数
      return { text: text || undefined };
    } catch (e) {
      errorCountRef.current += 1;
      console.warn(`SSE parse error (${errorCountRef.current}/${MAX_PARSE_ERRORS}):`, line);
      
      if (errorCountRef.current >= MAX_PARSE_ERRORS) {
        return { error: '响应数据格式异常，流式输出已中断' };
      }
      return {};
    }
  }, [extractContent]);

  /**
   * 重置解析状态
   */
  const reset = useCallback(() => {
    errorCountRef.current = 0;
  }, []);

  return { parseLine, reset };
}
