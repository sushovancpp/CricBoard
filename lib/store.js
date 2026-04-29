// Global singleton — survives Next.js hot reloads in dev
if (!global.__cricketStore) {
  global.__cricketStore = {
    match: null,
    clients: new Set(),
  };
}
export const store = global.__cricketStore;

// ── SSE broadcast ──────────────────────────────────────────
export function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  const enc = new TextEncoder().encode(msg);
  const dead = [];
  store.clients.forEach((ctrl) => {
    try { ctrl.enqueue(enc); }
    catch { dead.push(ctrl); }
  });
  dead.forEach((c) => store.clients.delete(c));
}

// ── Helpers ────────────────────────────────────────────────
export function oversStr(lb) {
  return `${Math.floor(lb / 6)}.${lb % 6}`;
}
export function runRate(runs, lb) {
  if (!lb) return '0.00';
  return ((runs / lb) * 6).toFixed(2);
}
export function reqRunRate(target, currRuns, totalOvers, lb) {
  const remainingRuns  = target - currRuns;
  const remainingBalls = totalOvers * 6 - lb;
  if (remainingBalls <= 0) return '∞';
  if (remainingRuns <= 0) return '0.00';
  return ((remainingRuns / remainingBalls) * 6).toFixed(2);
}

// ── Factory ────────────────────────────────────────────────
export function makeInnings(battingTeam, bowlingTeam) {
  return {
    battingTeam,
    bowlingTeam,
    runs: 0,
    wickets: 0,
    lb: 0,          // legitimate balls
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    striker:    { name: '', runs: 0, balls: 0, fours: 0, sixes: 0 },
    nonStriker: { name: '', runs: 0, balls: 0, fours: 0, sixes: 0 },
    bowler: { name: '', lb: 0, runs: 0, wickets: 0 },
    currentOver: [],   // codes in current over (all deliveries)
    lastBalls:   [],   // last 18 delivery codes for trail display
    undoStack:   [],   // last 5 state snapshots for undo
    completed:   false,
  };
}

// ── Core ball engine ───────────────────────────────────────
export function applyBall(inn, payload, totalOvers) {
  const { type, runs = 0, newBatsmanName = 'Player', wicketType = '' } = payload;
  // Snapshot before mutation (for undo)
  const snap = JSON.parse(JSON.stringify(inn));
  inn.undoStack.push(snap);
  if (inn.undoStack.length > 5) inn.undoStack.shift();

  let code = '';
  let legitimate = false;

  switch (type) {
    case 'runs': {
      inn.runs           += runs;
      inn.striker.runs   += runs;
      inn.striker.balls  += 1;
      inn.bowler.runs    += runs;
      inn.bowler.lb      += 1;
      inn.lb             += 1;
      if (runs === 4) inn.striker.fours++;
      if (runs === 6) inn.striker.sixes++;
      code       = runs === 0 ? '•' : String(runs);
      legitimate = true;
      // Strike rotation: odd runs
      if (runs % 2 === 1) {
        [inn.striker, inn.nonStriker] = [inn.nonStriker, inn.striker];
      }
      break;
    }
    case 'wide': {
      const wr = runs + 1;
      inn.runs            += wr;
      inn.extras.wides    += wr;
      inn.bowler.runs     += wr;
      code       = runs > 0 ? `Wd+${runs}` : 'Wd';
      legitimate = false;
      break;
    }
    case 'noball': {
      const nr = runs + 1;
      inn.runs            += nr;
      inn.extras.noBalls  += 1;
      inn.striker.runs    += runs;
      inn.bowler.runs     += nr;
      code       = runs > 0 ? `NB+${runs}` : 'NB';
      legitimate = false;
      if (runs % 2 === 1) {
        [inn.striker, inn.nonStriker] = [inn.nonStriker, inn.striker];
      }
      break;
    }
    case 'wicket': {
      inn.wickets          += 1;
      inn.striker.balls    += 1;
      inn.bowler.lb        += 1;
      inn.bowler.wickets   += 1;
      inn.lb               += 1;
      if (runs > 0) {
        inn.runs           += runs;
        inn.striker.runs   += runs;
        inn.bowler.runs    += runs;
      }
      code       = runs > 0 ? `${runs}W` : 'W';
      legitimate = true;
      // New batsman replaces striker
      inn.striker = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
      if (runs % 2 === 1) {
        [inn.striker, inn.nonStriker] = [inn.nonStriker, inn.striker];
      }
      break;
    }
    case 'bye': {
      inn.runs            += runs;
      inn.extras.byes     += runs;
      inn.striker.balls   += 1;
      inn.bowler.lb       += 1;
      inn.lb              += 1;
      code       = `B${runs}`;
      legitimate = true;
      if (runs % 2 === 1) {
        [inn.striker, inn.nonStriker] = [inn.nonStriker, inn.striker];
      }
      break;
    }
    case 'legbye': {
      inn.runs            += runs;
      inn.extras.legByes  += runs;
      inn.striker.balls   += 1;
      inn.bowler.lb       += 1;
      inn.lb              += 1;
      code       = `LB${runs}`;
      legitimate = true;
      if (runs % 2 === 1) {
        [inn.striker, inn.nonStriker] = [inn.nonStriker, inn.striker];
      }
      break;
    }
    default: break;
  }

  // Track ball displays
  inn.currentOver.push(code);
  inn.lastBalls.push(code);
  if (inn.lastBalls.length > 18) inn.lastBalls.shift();

  // End of over (6 legitimate balls)
  if (legitimate && inn.lb % 6 === 0 && inn.lb > 0) {
    [inn.striker, inn.nonStriker] = [inn.nonStriker, inn.striker];
    inn.currentOver = [];
  }

  // Check innings complete (all out or overs done)
  if (inn.wickets >= 10 || (totalOvers && inn.lb >= totalOvers * 6)) {
    inn.completed = true;
  }

  return inn;
}

// ── Undo last ball ─────────────────────────────────────────
export function undoBall(inn) {
  if (!inn.undoStack.length) return inn;
  return inn.undoStack.pop();
}
