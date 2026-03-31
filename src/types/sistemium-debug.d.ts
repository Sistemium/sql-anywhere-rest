declare module 'sistemium-debug' {
  import { Debugger } from 'debug';
  export default function (ns: string): { debug: Debugger; error: Debugger };
}
