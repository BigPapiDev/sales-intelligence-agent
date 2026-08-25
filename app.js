import { approve, chooseSlot, editReply, startWorkflow } from "./workflow.mjs";

let workflow = startWorkflow({
  request: {
    customer: "Giulia Bianchi",
    email: "giulia@example.test",
    subject: "Richiesta appuntamento",
    message: "Vorrei fissare un incontro per discutere il progetto.",
  },
  candidateSlots: ["2026-04-08T09:00", "2026-04-08T10:00", "2026-04-08T11:00", "2026-04-08T14:00"],
  busySlots: ["2026-04-08T10:00"],
});

const app = document.querySelector("main");

function formatSlot(slot) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "full", timeStyle: "short" }).format(new Date(slot));
}

function render() {
  const { request, slots, selectedSlot, event, approved } = workflow;
  app.replaceChildren();

  const heading = document.createElement("h1");
  heading.textContent = approved ? "Appuntamento confermato" : "Nuova richiesta di appuntamento";
  app.append(heading);

  const requestCard = card("Richiesta", `${request.customer} · ${request.email}`, request.message);
  app.append(requestCard);

  const slotsCard = document.createElement("section");
  slotsCard.className = "card";
  slotsCard.append(Object.assign(document.createElement("h2"), { textContent: "Orari proposti" }));
  const choices = document.createElement("div");
  choices.className = "choices";
  slots.forEach((slot) => {
    const button = document.createElement("button");
    button.textContent = formatSlot(slot);
    button.className = slot === selectedSlot ? "selected" : "";
    button.disabled = approved;
    button.onclick = () => { workflow = chooseSlot(workflow, slot); render(); };
    choices.append(button);
  });
  slotsCard.append(choices);
  app.append(slotsCard);

  const replyCard = document.createElement("section");
  replyCard.className = "card";
  replyCard.append(Object.assign(document.createElement("h2"), { textContent: "Risposta da inviare" }));
  const reply = document.createElement("textarea");
  reply.setAttribute("aria-label", "Risposta da inviare");
  reply.value = workflow.reply;
  reply.disabled = approved;
  reply.oninput = () => { workflow = editReply(workflow, reply.value); };
  replyCard.append(reply);
  app.append(replyCard);

  const eventCard = card("Evento in calendario", `${event.title} · ${formatSlot(event.start)}`, approved ? "Evento creato nella simulazione." : "Verrà creato dopo la tua approvazione.");
  app.append(eventCard);

  if (!approved) {
    const button = document.createElement("button");
    button.className = "approve";
    button.textContent = "Approva e invia";
    button.onclick = () => { workflow = approve(workflow); render(); };
    app.append(button);
  }
}

function card(title, subtitle, text) {
  const section = document.createElement("section");
  section.className = "card";
  section.append(Object.assign(document.createElement("h2"), { textContent: title }));
  section.append(Object.assign(document.createElement("strong"), { textContent: subtitle }));
  section.append(Object.assign(document.createElement("p"), { textContent: text }));
  return section;
}

render();
