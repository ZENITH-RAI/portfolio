const particles = [];
for (let i = 0; i < 500; i++) {
  particles.push({ x: Math.random() * 1000, y: Math.random() * 1000 });
}

function runOld() {
  let count = 0;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        count++;
      }
    }
  }
  return count;
}

function runNew() {
  let count = 0;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distSq = dx * dx + dy * dy;
      if (distSq < 16900) { // 130 * 130
        const dist = Math.sqrt(distSq);
        count++;
      }
    }
  }
  return count;
}

// Warmup
for (let i = 0; i < 100; i++) runOld();
for (let i = 0; i < 100; i++) runNew();

console.time("Old - Math.sqrt every iteration");
for (let i = 0; i < 2000; i++) runOld();
console.timeEnd("Old - Math.sqrt every iteration");

console.time("New - Squared threshold check");
for (let i = 0; i < 2000; i++) runNew();
console.timeEnd("New - Squared threshold check");
