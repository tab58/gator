import { ChildProcess, spawn } from 'child_process';

export class WorkerProcess {
  get hasExited() { return this._hasExited; }
  
  public readonly onExit: Promise<any>;
  private _hasExited: boolean;
  private _process: ChildProcess;

  constructor(cmd: string, args: string[] = [], options: any = {}) {
    const proc = spawn(cmd, args, options);

    // attach events
    proc.stdout.pipe(process.stdout);
    this._process = proc;
    this._hasExited = false;

    this.onExit = (new Promise((resolve, reject) => {
      this._process.once('exit', (code: number, signal: string) => {
        if (code === 0) {
          resolve(undefined);
        } else if (signal === 'SIGKILL') {
          // this happens with 'kill -9', which is used in kill().
          resolve(code);
        } else {
          reject(new Error(`Exit via ${signal} with error code: ${code}`));
        }
      });
    })).then(() => {
      this._hasExited = true;
    });
  }

  kill() {
    const pid = this._process.pid;
    this._process.stdin.end();
    switch(process.platform) {
      case 'darwin':
        spawn('kill', ['-9', `${pid}`]);
        break;
      case 'win32':
        // use exec()?
        spawn('taskkill', [`/PID ${pid} /T /F`]);
        break;
      default:
        throw new Error(`No defined kill() for platform '${process.platform}'.`);
    }
  }

  get pid() { return this._process.pid; }
}