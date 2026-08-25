import test from "node:test";
import assert from "node:assert/strict";
import { approve, chooseSlot, startWorkflow } from "../workflow.mjs";

const request = {
  customer: "Giulia Bianchi",
  email: "giulia@example.test",
  subject: "Richiesta appuntamento",
  message: "Vorrei fissare un incontro per discutere il progetto.",
};

const candidates = [
  "2026-04-08T09:00",
  "2026-04-08T10:00",
  "2026-04-08T11:00",
  "2026-04-08T14:00",
];

test("starts a scheduling workflow with three available slots and a pending event", () => {
  const workflow = startWorkflow({
    request,
    candidateSlots: candidates,
    busySlots: ["2026-04-08T10:00"],
  });

  assert.deepEqual(workflow.slots, [
    "2026-04-08T09:00",
    "2026-04-08T11:00",
    "2026-04-08T14:00",
  ]);
  assert.equal(workflow.selectedSlot, "2026-04-08T09:00");
  assert.equal(workflow.event.status, "pending");
  assert.match(workflow.reply, /Giulia/);
  assert.equal(workflow.approved, false);
});

test("changes the pending event and completes both actions only after approval", () => {
  const workflow = startWorkflow({ request, candidateSlots: candidates });
  const changed = chooseSlot(workflow, "2026-04-08T11:00");
  const approved = approve(changed);

  assert.equal(changed.event.start, "2026-04-08T11:00");
  assert.match(changed.reply, /2026-04-08T11:00/);
  assert.equal(changed.approved, false);
  assert.equal(approved.approved, true);
  assert.equal(approved.event.status, "created");
  assert.deepEqual(approved.audit, [
    { action: "reply-sent", recipient: "giulia@example.test" },
    { action: "event-created", start: "2026-04-08T11:00" },
  ]);
});
