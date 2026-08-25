export function startWorkflow({ request, candidateSlots, busySlots = [] }) {
  const slots = candidateSlots.filter((slot) => !busySlots.includes(slot)).slice(0, 3);
  if (!slots.length) throw new Error("No available appointment slots");

  return buildWorkflow(request, slots, slots[0]);
}

export function chooseSlot(workflow, selectedSlot) {
  if (!workflow.slots.includes(selectedSlot)) throw new Error("Slot was not proposed");
  return buildWorkflow(workflow.request, workflow.slots, selectedSlot, workflow.replyEdited ? workflow.reply : undefined, workflow.replyEdited);
}

export function editReply(workflow, reply) {
  return { ...workflow, reply, replyEdited: true };
}

export function approve(workflow) {
  return {
    ...workflow,
    approved: true,
    event: { ...workflow.event, status: "created" },
    audit: [
      { action: "reply-sent", recipient: workflow.request.email },
      { action: "event-created", start: workflow.selectedSlot },
    ],
  };
}

function buildWorkflow(request, slots, selectedSlot, reply = draftReply(request, selectedSlot), replyEdited = false) {
  return {
    request,
    slots,
    selectedSlot,
    reply,
    replyEdited,
    approved: false,
    audit: [],
    event: {
      title: `Appuntamento con ${request.customer}`,
      start: selectedSlot,
      durationMinutes: 30,
      status: "pending",
    },
  };
}

function draftReply(request, selectedSlot) {
  return `Ciao ${request.customer.split(" ")[0]},\n\nGrazie per la richiesta. Ti propongo questo appuntamento: ${selectedSlot}.\n\nA presto,`;
}
