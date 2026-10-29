import React from 'react';
import { PwaControls } from './PwaControls';

const REPOSITORY_URL = 'https://github.com/xzh-xzh/shuttle-bus-schedule';

export const AppCredit: React.FC = () => (
  <>
    <PwaControls />
    <p className="mt-6 pb-2 text-center text-[11px] text-slate-600">
      created by 缘天天
      <span className="mx-1.5" aria-hidden="true">·</span>
      <a
        href={REPOSITORY_URL}
        target="_blank"
        rel="noreferrer"
        className="transition-colors hover:text-slate-400"
      >
        GitHub
      </a>
    </p>
  </>
);
