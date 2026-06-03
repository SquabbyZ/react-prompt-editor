import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import AllNodesLocked from '../../docs/examples/all-nodes-locked';
import LeafAndContentLocked from '../../docs/examples/leaf-and-content-locked';
import LockedStateVisualCue from '../../docs/examples/locked-state-visual-cue';
// 009: Vite 4 dev mode does not expand `@tailwind` directives in JS-
// imported CSS modules (verified: served CSS is 14,950 chars but contains
// 0 `.border-red-500` rules; only the variables.css @import gets inlined).
// Easiest correct path: use the production-built dist/styles/index.css
// (compiled by `pnpm build:css`) and add a dev:css watch script so the
// CSS is rebuilt when source changes. See package.json dev scripts.
import '../../dist/styles/index.css';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ConfigProvider locale={zhCN}>
    <div data-test-demo="all-nodes-locked" className="demo-block">
      <h2>Demo 1: all-nodes-locked</h2>
      <h3>Click the lock button on every node. The "all-locked" indicator should become visible.</h3>
      <AllNodesLocked />
    </div>

    <div data-test-demo="leaf-and-content-locked" className="demo-block">
      <h2>Demo 2: leaf-and-content-locked</h2>
      <h3>Click the lock button on every leaf and every non-empty content node. Both indicators should become visible.</h3>
      <LeafAndContentLocked />
    </div>

    <div data-test-demo="locked-state-visual-cue" className="demo-block">
      <h2>Demo 3: locked-state-visual-cue</h2>
      <h3>Initially 2/3/4 are unlocked and highlighted with red border. After locking all, red border disappears and indicator shows.</h3>
      <LockedStateVisualCue />
    </div>
  </ConfigProvider>,
);
