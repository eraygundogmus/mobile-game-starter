// Balance sim: bots play many seeded runs, then the gates in CONFIG.balance check the result.
// CI runs this. Do not loosen a gate to make it pass: fix the numbers in the canon first.
// Usage: npm run sim [-- --runs 500] [-- --json]
import { CONFIG, createRun, greedyBot, idleBot, step, type Bot } from '../src';

const args = process.argv.slice(2);
const runsArg = args.indexOf('--runs');
const runs = runsArg >= 0 ? Number(args[runsArg + 1]) : CONFIG.balance.runs;
const asJson = args.includes('--json');

interface Stats {
  medianSeconds: number;
  p10Seconds: number;
  p90Seconds: number;
  medianScore: number;
  timeEnds: number;
}

function quantile(sorted: number[], q: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]!;
}

function measure(makeBot: () => Bot): Stats {
  const seconds: number[] = [];
  const scores: number[] = [];
  let timeEnds = 0;
  for (let seed = 1; seed <= runs; seed++) {
    const bot = makeBot();
    const run = createRun(seed);
    while (!run.end) step(run, bot(run));
    seconds.push(run.tick / CONFIG.ticksPerSecond);
    scores.push(run.score);
    if (run.end === 'time') timeEnds++;
  }
  seconds.sort((a, b) => a - b);
  scores.sort((a, b) => a - b);
  return {
    medianSeconds: quantile(seconds, 0.5),
    p10Seconds: quantile(seconds, 0.1),
    p90Seconds: quantile(seconds, 0.9),
    medianScore: quantile(scores, 0.5),
    timeEnds,
  };
}

const report = { runs, greedy: measure(() => greedyBot()), idle: measure(() => idleBot) };
const { greedyMedianSeconds, idleMedianSeconds } = CONFIG.balance;
const gates = [
  {
    name: `greedy bot median survival in [${greedyMedianSeconds.min}, ${greedyMedianSeconds.max}] s (skill matters, but the game is not solved)`,
    pass: report.greedy.medianSeconds >= greedyMedianSeconds.min && report.greedy.medianSeconds <= greedyMedianSeconds.max,
  },
  {
    name: `idle bot median survival <= ${idleMedianSeconds.max} s (doing nothing loses)`,
    pass: report.idle.medianSeconds <= idleMedianSeconds.max,
  },
];

if (asJson) {
  console.log(JSON.stringify({ ...report, gates }, null, 2));
} else {
  console.log(`Balance sim: ${runs} seeds per bot\n`);
  console.log('bot     median s  p10 s  p90 s  median score  ran to time');
  for (const [name, s] of [['greedy', report.greedy], ['idle', report.idle]] as const) {
    console.log(
      `${name.padEnd(7)} ${s.medianSeconds.toFixed(1).padStart(8)} ${s.p10Seconds.toFixed(1).padStart(6)} ${s.p90Seconds.toFixed(1).padStart(6)} ${String(s.medianScore).padStart(13)} ${String(s.timeEnds).padStart(12)}`,
    );
  }
  console.log('');
  for (const g of gates) console.log(`${g.pass ? 'PASS' : 'FAIL'}  ${g.name}`);
}

if (gates.some((g) => !g.pass)) process.exit(1);
