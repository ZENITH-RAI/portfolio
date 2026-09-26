const puppeteer = require('puppeteer');

async function runBenchmark() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Expose a function to collect performance marks
  await page.exposeFunction('collectMetrics', (metrics) => {
    // console.log(metrics);
  });

  await page.goto('file://' + process.cwd() + '/index.html', { waitUntil: 'networkidle0' });

  // Simulate mouse movements and measure frame rate/paint time
  const metrics = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let frames = 0;
      let startTime = performance.now();
      let lastTime = startTime;
      const duration = 2000; // 2 seconds

      let totalFrameTime = 0;
      let maxFrameTime = 0;

      function rafLoop(currentTime) {
        frames++;
        const frameTime = currentTime - lastTime;
        totalFrameTime += frameTime;
        if (frameTime > maxFrameTime) maxFrameTime = frameTime;
        lastTime = currentTime;

        if (currentTime - startTime < duration) {
          requestAnimationFrame(rafLoop);
        } else {
          resolve({
            frames,
            fps: (frames / (duration / 1000)).toFixed(2),
            avgFrameTime: (totalFrameTime / frames).toFixed(2),
            maxFrameTime: maxFrameTime.toFixed(2)
          });
        }
      }

      requestAnimationFrame(rafLoop);

      // simulate mouse moves
      let moveInterval = setInterval(() => {
         const event = new MouseEvent('mousemove', {
            clientX: Math.random() * window.innerWidth,
            clientY: Math.random() * window.innerHeight
         });
         window.dispatchEvent(event);
      }, 16);

      setTimeout(() => clearInterval(moveInterval), duration);
    });
  });

  console.log("Benchmark Results:");
  console.log(`FPS: ${metrics.fps}`);
  console.log(`Avg Frame Time: ${metrics.avgFrameTime} ms`);
  console.log(`Max Frame Time: ${metrics.maxFrameTime} ms`);

  await browser.close();
}

runBenchmark();
