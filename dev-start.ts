import { WorkerProcess } from './dev/workerProcess';
import { watch } from 'chokidar';
import { connect } from 'ngrok';

const LOCAL_NGROK_PORT = 8331;

const watcher = watch('./src', {
  ignored: /(^|[\/\\])\../
});
watcher.on('ready', () => {
  console.log('Initial scan complete. Watcher ready.');
  const watchedPaths = watcher.getWatched();
  console.log('Watcher paths:');
  Object.keys(watchedPaths).forEach(key => {
    console.log(`${key}: ${watchedPaths[key]}`);
  });
});
watcher.on('error', () => {
  console.error('Error happened.');
});

connect(LOCAL_NGROK_PORT).then(publicUrl => {
  console.log(`http://localhost:${LOCAL_NGROK_PORT}/ now bound to ${publicUrl}.`);
  let appProcess = new WorkerProcess('ts-node', ['./src/index.ts', `${publicUrl}`], {
    detached: false,
    stdio: 'pipe'
  });
  // clear caches and reload process
  watcher.on('change', () => {
    if (!appProcess.hasExited) {
      console.log("Stopping and reloading process...");
      appProcess.kill();
    }
    // start a new WorkerProcess
    appProcess = new WorkerProcess('ts-node', ['./src/index.ts', `${publicUrl}`], {
      detached: false,
      stdio: 'pipe'
    });
    console.log(`Process loaded with ID ${appProcess.pid}.`);
  });
}).catch(err => {
  console.log(`Error in ngrok.connect(): ${err}`);
});
