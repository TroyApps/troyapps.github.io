const ACTIONS = Object.freeze({
  poke: Object.freeze({
    name: "poke",
    sequence: Object.freeze(["poke", "recover"]),
    effect: null,
    cooldownMs: 450,
  }),
  bazooka: Object.freeze({
    name: "bazooka",
    sequence: Object.freeze(["bazookaAim", "bazookaFire", "rocketFlight", "pixelScattered"]),
    effect: "bazookaLaunch",
    cooldownMs: 1200,
  }),
  whip: Object.freeze({
    name: "whip",
    sequence: Object.freeze(["whipHit", "recover"]),
    effect: "whip",
    cooldownMs: 900,
  }),
});

const POKE_REACTIONS = Object.freeze({
  surprised: Object.freeze({
    dialogueKey: "pokeSurprised",
    expression: "Surprised",
    sequence: Object.freeze(["poke", "recover"]),
  }),
  annoyed: Object.freeze({
    dialogueKey: "pokeAnnoyed",
    expression: "Angry",
    sequence: Object.freeze(["poke", "annoyed", "recover"]),
  }),
  defensive: Object.freeze({
    dialogueKey: "pokeDefensive",
    expression: "Defensive",
    sequence: Object.freeze(["recover"]),
    effect: "pokeGuard",
  }),
});

const WHIP_REACTIONS = Object.freeze({
  surprised: Object.freeze({
    dialogueKey: "whipSurprised",
    expression: "Surprised",
    sequence: Object.freeze(["whipHit", "recover"]),
    effect: "whipCrack",
  }),
  annoyed: Object.freeze({
    dialogueKey: "whipAnnoyed",
    expression: "Angry",
    sequence: Object.freeze(["whipHit", "annoyed", "recover"]),
    effect: "whipCrack",
  }),
  defensive: Object.freeze({
    dialogueKey: "whipDefensive",
    expression: "Defensive",
    sequence: Object.freeze(["recover"]),
    effect: "whipCaught",
  }),
});

export function getTroyAction(name) {
  const action = ACTIONS[name];
  return action ? { ...action, sequence: [...action.sequence] } : null;
}

export function isTroyTool(name) {
  return Object.hasOwn(ACTIONS, name);
}

export function resolveTroyReaction(name, tier = "surprised") {
  if (name === "poke") {
    const reaction = POKE_REACTIONS[tier] || POKE_REACTIONS.surprised;
    const resolved = {
      dialogueKey: reaction.dialogueKey,
      expression: reaction.expression,
      sequence: [...reaction.sequence],
    };
    if (reaction.effect) resolved.effect = reaction.effect;
    return resolved;
  }

  if (name === "bazooka") {
    const action = ACTIONS.bazooka;
    return {
      dialogueKey: "bazooka",
      expression: "Angry",
      sequence: [...action.sequence],
      effect: action.effect,
    };
  }

  if (name === "whip") {
    const reaction = WHIP_REACTIONS[tier] || WHIP_REACTIONS.surprised;
    return {
      dialogueKey: reaction.dialogueKey,
      expression: reaction.expression,
      sequence: [...reaction.sequence],
      effect: reaction.effect,
    };
  }

  const action = getTroyAction(name);
  return action ? { dialogueKey: name, expression: null, sequence: [...action.sequence] } : null;
}

export function isActionReady(lastRunAt, now, cooldownMs) {
  return now - lastRunAt >= cooldownMs;
}

export function createLatestActionQueue() {
  let pending = null;

  return {
    request(name) {
      if (isTroyTool(name)) pending = name;
    },
    take() {
      const value = pending;
      pending = null;
      return value;
    },
    clear() {
      pending = null;
    },
    size() {
      return pending === null ? 0 : 1;
    },
  };
}
