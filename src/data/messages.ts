/**
 * Letters from the founders, shown in the popup opened from the team cards.
 *
 * Transcribed from the signed documents (public/yogeshwor.png, public/eron.jpg)
 * with their formatting intact: paragraphs, the epigraph, bold passages, the
 * "Get in Touch" heading and the signature blocks.
 *
 * Inline markup inside any `text`: **bold** and *italic*.
 *
 * Edit the text here — the modal and the buttons in `AboutPage` read from these
 * constants and need no changes.
 */
export type MessageBlock =
  /** Opening quotation, set italic with its attribution. */
  | { kind: "epigraph"; text: string; source: string }
  /** The italic byline printed under the letter's title: "Name | Role". */
  | { kind: "byline"; text: string }
  /** A body paragraph. The first `p` gets a bronze drop cap. */
  | { kind: "p"; text: string }
  /** A subheading inside the letter, e.g. "Get in Touch". */
  | { kind: "h"; text: string }
  /** The signature at the foot of the letter. */
  | { kind: "sign"; lines: string[]; style: "bold" | "italic" };

export const presidentMessage: MessageBlock[] = [
  {
    kind: "byline",
    text: "Yogeshwor Sharma | Founder, President Institute for Educational Accountability",
  },
  {
    kind: "p",
    text: "I have always liked the idea of building something that outlives the effort put into it. Something that doesn't just exist for its own sake but actually makes a difference to the people around it.",
  },
  {
    kind: "p",
    text: "That is why I led the operations of IEA. I saw an opportunity to be part of something bigger than myself, to work alongside people who want to turn their ideas into something tangible. I believe some of the most worthwhile things we can do are those whose benefits extend beyond our own lives.",
  },
  {
    kind: "p",
    text: "IEA has also been a learning experience in its own right. Managing the organization has taught me how institutions function in practice, the constraints they face, and the gap between what people say and what actually happens. I've learned to look beyond appearances, question what I'm told, and recognize that meaningful change is often more complicated than it seems. Indeed, the findings of IEA might help to ensure the better school environment for my fellow students. But the efforts I put into building that platform and eventual results I could deliver is what makes this journey truly meaningful.",
  },
  {
    kind: "p",
    text: "For me, this journey is about learning by doing, taking responsibility, and seeing what we can accomplish when we commit ourselves to a common purpose. I don't think making a difference always requires having all the answers. Sometimes, it starts with recognizing that something can be better and being willing to put in the work to make it so.",
  },
  {
    kind: "p",
    text: "**IEA is not only something I hope to build, but an experience that continues to shape how I understand the world around me. It is a manifestation of my desire to build something that outlives my ideas and serves the common good of the people.**",
  },
  {
    kind: "sign",
    style: "bold",
    lines: [
      "Yogeshwor Sharma",
      "President, Institute for Educational Accountability (IEA)",
    ],
  },
];

export const founderMessage: MessageBlock[] = [
  {
    kind: "byline",
    text: "Eron Subedi | Founder, Institute for Educational Accountability",
  },
  {
    kind: "epigraph",
    text: "\"Ambition must be made to counteract ambition.\"",
    source: "James Madison, The Federalist No. 51",
  },
  {
    kind: "p",
    text: "I have always believed that institutions entrusted with responsibility should also be expected to answer for how they exercise it. James Madison's insight captures the principle that inspired me to establish the Institute for Educational Accountability (IEA): **accountability should never depend solely on the goodwill of those in power.**",
  },
  {
    kind: "p",
    text: "I founded IEA because I felt that contributing to meaningful institutional accountability was something I ought to do. Education has a profound influence on students' lives, and I believe students deserve institutions that are willing to listen, explain their decisions, and acknowledge where improvement is needed. I do not see this work as merely an interest of mine, but as a responsibility I have chosen to undertake.",
  },
  {
    kind: "p",
    text: "At IEA, we conduct school-level research, investigate publicly available information, carry out surveys, and examine documentary evidence. We strive to ensure that our claims are grounded in facts and that our conclusions never exceed what the evidence supports. Our purpose is to **highlight concerns, not manufacture accusations**. Where necessary, we pursue appropriate remedies through lawful channels, including legal action when warranted.",
  },
  {
    kind: "p",
    text: "I also recognize that accountability must apply to the people demanding it, including myself. If I expect institutions to justify their decisions, I must be equally willing to explain my own. For me, accountability is not a standard to impose selectively; it is a principle to uphold at every step.",
  },
  {
    kind: "p",
    text: "Madison's words have shaped how I understand this responsibility. Wherever power exists, there must be meaningful scrutiny. Wherever decisions affect students, there must be room for questions. And wherever shortcomings are identified, there should be a genuine opportunity for correction.",
  },
  {
    kind: "p",
    text: "IEA is my contribution toward making these principles a meaningful part of education. I do not expect to solve every problem, but I believe that careful research, intellectual honesty, and determined, lawful action can make a difference.",
  },
  {
    kind: "p",
    text: "**This is why I founded IEA, and this is the mission I intend to pursue.**",
  },
  { kind: "h", text: "Get in Touch" },
  {
    kind: "p",
    text: "For inquiries concerning IEA's research, initiatives, or institutional work, please contact me at **founder@ieainstitute.org**.",
  },
  {
    kind: "p",
    text: "For personal correspondence or to connect with me directly, you may reach me at **eron1776@gmail.com**.",
  },
  {
    kind: "sign",
    style: "italic",
    lines: [
      "Eron Subedi",
      "Founder, Institute for Educational Accountability (IEA)",
    ],
  },
];
