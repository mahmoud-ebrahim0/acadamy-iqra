const PptxGenJS = require("pptxgenjs");
const path = require("path");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9"; // Widescreen 13.33 x 7.5 inches
pptx.author = "Ahmed Ayoub";
pptx.title = "Ahmed Ayoub - Electrical Power Engineering Presentation";

// Color Palette (Clean Executive Palette - No overlap guaranteed)
const COLORS = {
  bgSlide: "FFFFFF",     // Crisp White
  bgCard: "F8FAFC",      // Soft Slate Card
  bgInner: "F1F5F9",     // Sub-Card Background
  textNavy: "0F172A",    // Deep Navy Primary Text
  textGray: "475569",    // Dark Gray Body Text
  accentBlue: "0284C7",  // Ocean Blue Accent
  accentBlueDark: "0369A1",
  borderLight: "CBD5E1", // Clear Border
};

// Helper for Standard Slide Header
function addStandardHeader(slide, titleText, categoryText) {
  slide.background = { color: COLORS.bgSlide };

  // Top Accent Bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 0.12,
    fill: { color: COLORS.accentBlue }
  });

  // Category Tag
  slide.addText(categoryText.toUpperCase(), {
    x: 0.8, y: 0.4, w: 11.73, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.accentBlue, fontFace: "Segoe UI",
    margin: 0
  });

  // Slide Title
  slide.addText(titleText, {
    x: 0.8, y: 0.7, w: 11.73, h: 0.5,
    fontSize: 26, bold: true, color: COLORS.textNavy, fontFace: "Segoe UI",
    margin: 0
  });

  // Separator Line
  slide.addShape(pptx.shapes.LINE, {
    x: 0.8, y: 1.3, w: 11.73, h: 0,
    line: { color: COLORS.borderLight, width: 1 }
  });
}

// -------------------------------------------------------------
// SLIDE 1: Title / Cover Slide
// -------------------------------------------------------------
const slide1 = pptx.addSlide();
slide1.background = { color: COLORS.bgSlide };

// Top Bar
slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 0, y: 0, w: 13.33, h: 0.15,
  fill: { color: COLORS.accentBlue }
});

// Category Badge
slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 1.0, y: 0.7, w: 4.8, h: 0.45,
  fill: { color: COLORS.bgCard },
  line: { color: COLORS.accentBlue, width: 1.5 },
  rectRadius: 0.1
});
slide1.addText("ELECTRICAL POWER ENGINEERING", {
  x: 1.0, y: 0.7, w: 4.8, h: 0.45,
  align: "center", valign: "middle",
  fontSize: 11, bold: true, color: COLORS.accentBlue, fontFace: "Segoe UI"
});

// Name
slide1.addText("Ahmed Ayoub", {
  x: 1.0, y: 1.35, w: 11.33, h: 1.0,
  fontSize: 48, bold: true, color: COLORS.textNavy, fontFace: "Segoe UI",
  margin: 0
});

// Subtitle
slide1.addText("Personal Introduction & Career Goals Presentation", {
  x: 1.0, y: 2.45, w: 11.33, h: 0.5,
  fontSize: 20, bold: true, color: COLORS.accentBlue, fontFace: "Segoe UI",
  margin: 0
});

// 4 Info Cards (Grid)
const coverData = [
  { label: "UNIVERSITY", val: "Tanta University" },
  { label: "FACULTY", val: "Faculty of Engineering" },
  { label: "DEPARTMENT", val: "Electrical Power Engineering" },
  { label: "ACADEMIC YEAR", val: "1st Year Student (Freshman)" }
];

coverData.forEach((item, idx) => {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const posX = 1.0 + col * 5.8;
  const posY = 3.3 + row * 1.5;

  slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: posX, y: posY, w: 5.53, h: 1.3,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.borderLight, width: 1.5 },
    rectRadius: 0.1
  });

  slide1.addText([
    { text: item.label + "\n", options: { fontSize: 11, bold: true, color: COLORS.accentBlue } },
    { text: item.val, options: { fontSize: 16, bold: true, color: COLORS.textNavy } }
  ], {
    x: posX + 0.3, y: posY + 0.2, w: 4.93, h: 0.9,
    valign: "top", fontFace: "Segoe UI", lineSpacing: 18, margin: 0
  });
});

// -------------------------------------------------------------
// SLIDE 2: About Me & Academic Profile
// -------------------------------------------------------------
const slide2 = pptx.addSlide();
addStandardHeader(slide2, "About Me & Academic Profile", "Personal Overview");

// Left Card: Profile Summary
slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.8, y: 1.6, w: 5.6, h: 5.2,
  fill: { color: COLORS.bgCard },
  line: { color: COLORS.borderLight, width: 1.5 },
  rectRadius: 0.12
});

slide2.addText("STUDENT PROFILE", {
  x: 1.1, y: 1.85, w: 5.0, h: 0.35,
  fontSize: 14, bold: true, color: COLORS.accentBlue, fontFace: "Segoe UI", margin: 0
});

slide2.addText([
  { text: "• Name: ", options: { bold: true, color: COLORS.accentBlue, fontSize: 15 } },
  { text: "Ahmed Ayoub\n\n", options: { bold: true, color: COLORS.textNavy, fontSize: 15 } },
  { text: "• University: ", options: { bold: true, color: COLORS.accentBlue, fontSize: 15 } },
  { text: "Tanta University\n\n", options: { bold: true, color: COLORS.textNavy, fontSize: 15 } },
  { text: "• Faculty: ", options: { bold: true, color: COLORS.accentBlue, fontSize: 15 } },
  { text: "Faculty of Engineering\n\n", options: { bold: true, color: COLORS.textNavy, fontSize: 15 } },
  { text: "• Department: ", options: { bold: true, color: COLORS.accentBlue, fontSize: 15 } },
  { text: "Electrical Power Engineering\n\n", options: { bold: true, color: COLORS.textNavy, fontSize: 15 } },
  { text: "• Academic Year: ", options: { bold: true, color: COLORS.accentBlue, fontSize: 15 } },
  { text: "1st Year Student (Freshman)", options: { bold: true, color: COLORS.textNavy, fontSize: 15 } }
], {
  x: 1.1, y: 2.35, w: 5.0, h: 4.2,
  valign: "top", fontFace: "Segoe UI", lineSpacing: 18, margin: 0
});

// Right Column: 4 Key Info Boxes
const profileBoxes = [
  { label: "INSTITUTION", val: "Tanta University — Faculty of Engineering" },
  { label: "SPECIALIZATION", val: "Electrical Power Engineering Department" },
  { label: "ACADEMIC LEVEL", val: "First Year Student (1st Year)" },
  { label: "MAIN PASSION", val: "Medium Voltage (MV) Switchgear & Distribution" }
];

profileBoxes.forEach((item, idx) => {
  const posY = 1.6 + idx * 1.32;
  slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8, y: posY, w: 5.73, h: 1.18,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.borderLight, width: 1.5 },
    rectRadius: 0.1
  });

  slide2.addText([
    { text: item.label + "\n", options: { fontSize: 10.5, bold: true, color: COLORS.accentBlue } },
    { text: item.val, options: { fontSize: 14, bold: true, color: COLORS.textNavy } }
  ], {
    x: 7.05, y: posY + 0.18, w: 5.23, h: 0.82,
    valign: "top", fontFace: "Segoe UI", lineSpacing: 16, margin: 0
  });
});

// -------------------------------------------------------------
// SLIDE 3: Core Engineering Goals (Phase 1)
// -------------------------------------------------------------
const slide3 = pptx.addSlide();
addStandardHeader(slide3, "Core Engineering Goals", "Career Phase 1");

const cards1 = [
  {
    num: "01",
    title: "Strong Base",
    points: [
      "Master electrical power engineering basics.",
      "Study circuits, transformers & electrical machines.",
      "Build a solid technical foundation."
    ]
  },
  {
    num: "02",
    title: "MV Switchgear",
    points: [
      "Specialize in Medium Voltage Switchgear.",
      "Master power distribution networks.",
      "Learn protection relays & circuit breakers."
    ]
  },
  {
    num: "03",
    title: "Practical Training",
    points: [
      "Summer engineering internships.",
      "Site visits to electrical substations.",
      "Real hands-on engineering projects."
    ]
  }
];

cards1.forEach((card, idx) => {
  const posX = 0.8 + idx * 3.98;
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: posX, y: 1.6, w: 3.64, h: 5.2,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.borderLight, width: 1.5 },
    rectRadius: 0.12
  });

  // Badge Number
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: posX + 0.3, y: 1.85, w: 0.8, h: 0.45,
    fill: { color: COLORS.accentBlue },
    rectRadius: 0.1
  });
  slide3.addText(card.num, {
    x: posX + 0.3, y: 1.85, w: 0.8, h: 0.45,
    align: "center", valign: "middle",
    fontSize: 14, bold: true, color: "FFFFFF", fontFace: "Segoe UI"
  });

  slide3.addText(card.title, {
    x: posX + 0.3, y: 2.45, w: 3.04, h: 0.6,
    fontSize: 18, bold: true, color: COLORS.textNavy, fontFace: "Segoe UI", margin: 0
  });

  slide3.addShape(pptx.shapes.LINE, {
    x: posX + 0.3, y: 3.15, w: 3.04, h: 0,
    line: { color: COLORS.borderLight, width: 1 }
  });

  const formattedPts = card.points.map(pt => ({
    text: "• " + pt + "\n\n",
    options: { color: COLORS.textGray, fontSize: 13.5, bold: true }
  }));

  slide3.addText(formattedPts, {
    x: posX + 0.3, y: 3.35, w: 3.04, h: 3.2,
    valign: "top", fontFace: "Segoe UI", lineSpacing: 16, margin: 0
  });
});

// -------------------------------------------------------------
// SLIDE 4: Certifications & Software
// -------------------------------------------------------------
const slide4 = pptx.addSlide();
addStandardHeader(slide4, "Certifications & Software Tools", "Career Phase 2");

// Left Column: Certifications
slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.8, y: 1.6, w: 5.6, h: 5.2,
  fill: { color: COLORS.bgCard },
  line: { color: COLORS.borderLight, width: 1.5 },
  rectRadius: 0.12
});

slide4.addText("TARGET CERTIFICATIONS", {
  x: 1.1, y: 1.85, w: 5.0, h: 0.35,
  fontSize: 15, bold: true, color: COLORS.accentBlue, fontFace: "Segoe UI", margin: 0
});

const certList = [
  { name: "ABB", text: "MV Switchgear, Protection Relays & Automation" },
  { name: "Schneider Electric", text: "Power Distribution & EcoStruxure Systems" },
  { name: "Siemens", text: "Power System Analysis & Smart Energy Solutions" }
];

certList.forEach((c, idx) => {
  const posY = 2.35 + idx * 1.35;
  slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.1, y: posY, w: 5.0, h: 1.2,
    fill: { color: COLORS.bgInner },
    line: { color: COLORS.borderLight, width: 1 },
    rectRadius: 0.1
  });

  slide4.addText([
    { text: c.name + "\n", options: { fontSize: 15, bold: true, color: COLORS.accentBlueDark } },
    { text: c.text, options: { fontSize: 12.5, bold: true, color: COLORS.textGray } }
  ], {
    x: 1.3, y: posY + 0.15, w: 4.6, h: 0.9,
    valign: "top", fontFace: "Segoe UI", lineSpacing: 14, margin: 0
  });
});

// Right Column: Software
slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 6.8, y: 1.6, w: 5.73, h: 5.2,
  fill: { color: COLORS.bgCard },
  line: { color: COLORS.borderLight, width: 1.5 },
  rectRadius: 0.12
});

slide4.addText("ENGINEERING SOFTWARE", {
  x: 7.05, y: 1.85, w: 5.23, h: 0.35,
  fontSize: 15, bold: true, color: COLORS.accentBlue, fontFace: "Segoe UI", margin: 0
});

const toolsList = [
  { name: "AutoCAD Electrical", desc: "Schematics & Panel Layout" },
  { name: "ETAP", desc: "Load Flow & Short Circuit Analysis" },
  { name: "DIgSILENT PowerFactory", desc: "Grid Stability & Modeling" },
  { name: "MATLAB & Simulink", desc: "Power System Simulations" }
];

toolsList.forEach((t, idx) => {
  const posY = 2.35 + idx * 1.02;
  slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.05, y: posY, w: 5.23, h: 0.92,
    fill: { color: COLORS.bgInner },
    line: { color: COLORS.borderLight, width: 1 },
    rectRadius: 0.1
  });

  slide4.addText([
    { text: t.name + "\n", options: { fontSize: 13.5, bold: true, color: COLORS.textNavy } },
    { text: t.desc, options: { fontSize: 11.5, color: COLORS.accentBlueDark } }
  ], {
    x: 7.25, y: posY + 0.12, w: 4.83, h: 0.68,
    valign: "top", fontFace: "Segoe UI", lineSpacing: 12, margin: 0
  });
});

// -------------------------------------------------------------
// SLIDE 5: Leadership, Skills & Safety
// -------------------------------------------------------------
const slide5 = pptx.addSlide();
addStandardHeader(slide5, "Skills, Leadership & Safety", "Career Phase 3");

const cards3 = [
  {
    title: "Leadership & Soft Skills",
    points: [
      "Technical problem solving skills.",
      "Clear engineering communication.",
      "Team leadership & project management."
    ]
  },
  {
    title: "Safety & System Reliability",
    points: [
      "Follow IEC & IEEE safety standards.",
      "Design reliable power grid networks.",
      "Minimize power loss & maximize efficiency."
    ]
  }
];

cards3.forEach((card, idx) => {
  const posX = 0.8 + idx * 5.98;
  slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: posX, y: 1.6, w: 5.6, h: 5.2,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.borderLight, width: 1.5 },
    rectRadius: 0.12
  });

  slide5.addText(card.title, {
    x: posX + 0.35, y: 1.85, w: 4.9, h: 0.5,
    fontSize: 18, bold: true, color: COLORS.accentBlueDark, fontFace: "Segoe UI", margin: 0
  });

  slide5.addShape(pptx.shapes.LINE, {
    x: posX + 0.35, y: 2.45, w: 4.9, h: 0,
    line: { color: COLORS.borderLight, width: 1 }
  });

  const formattedPts = card.points.map(pt => ({
    text: "✔ " + pt + "\n\n",
    options: { color: COLORS.textNavy, fontSize: 15, bold: true }
  }));

  slide5.addText(formattedPts, {
    x: posX + 0.35, y: 2.7, w: 4.9, h: 3.9,
    valign: "top", fontFace: "Segoe UI", lineSpacing: 18, margin: 0
  });
});

// -------------------------------------------------------------
// SLIDE 6: Career Roadmap
// -------------------------------------------------------------
const slide6 = pptx.addSlide();
addStandardHeader(slide6, "Career Roadmap", "Career Phase 4");

const roadmapCards = [
  {
    step: "STEP 1",
    title: "Leading Company in Egypt",
    desc: "Work for a top engineering firm in Egypt (Elsewedy, Schneider, or Siemens) to gain field experience."
  },
  {
    step: "STEP 2",
    title: "International Career",
    desc: "Expand career internationally, joining global power infrastructure & energy consultancies."
  },
  {
    step: "STEP 3",
    title: "Lead Mega Projects",
    desc: "Become a Senior Lead Electrical Power Engineer directing large-scale power projects."
  }
];

roadmapCards.forEach((r, idx) => {
  const posX = 0.8 + idx * 3.98;
  slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: posX, y: 1.6, w: 3.64, h: 5.2,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.borderLight, width: 1.5 },
    rectRadius: 0.12
  });

  // Step Badge
  slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: posX + 0.3, y: 1.85, w: 1.1, h: 0.4,
    fill: { color: COLORS.accentBlue },
    rectRadius: 0.1
  });
  slide6.addText(r.step, {
    x: posX + 0.3, y: 1.85, w: 1.1, h: 0.4,
    align: "center", valign: "middle",
    fontSize: 12, bold: true, color: "FFFFFF", fontFace: "Segoe UI"
  });

  slide6.addText(r.title, {
    x: posX + 0.3, y: 2.4, w: 3.04, h: 0.7,
    fontSize: 18, bold: true, color: COLORS.textNavy, fontFace: "Segoe UI", margin: 0
  });

  slide6.addShape(pptx.shapes.LINE, {
    x: posX + 0.3, y: 3.15, w: 3.04, h: 0,
    line: { color: COLORS.borderLight, width: 1 }
  });

  slide6.addText("• " + r.desc, {
    x: posX + 0.3, y: 3.35, w: 3.04, h: 3.2,
    fontSize: 14, bold: true, color: COLORS.textGray, fontFace: "Segoe UI", lineSpacing: 18, margin: 0
  });
});

// -------------------------------------------------------------
// SLIDE 7: Future Technologies
// -------------------------------------------------------------
const slide7 = pptx.addSlide();
addStandardHeader(slide7, "Future Technologies", "Continuous Learning");

const techList = [
  { title: "1. Renewable Energy", text: "Solar PV, Wind Energy & Battery Storage Systems (BESS)." },
  { title: "2. Smart Grids & Microgrids", text: "Automated Demand Response & Smart Metering Infrastructure." },
  { title: "3. Digital Substations", text: "IEC 61850 Protocol & Intelligent Electronic Devices (IEDs)." }
];

techList.forEach((t, idx) => {
  const posY = 1.6 + idx * 1.68;
  slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: posY, w: 11.73, h: 1.48,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.borderLight, width: 1.5 },
    rectRadius: 0.12
  });

  slide7.addText([
    { text: t.title + "\n", options: { fontSize: 17, bold: true, color: COLORS.accentBlueDark } },
    { text: "• " + t.text, options: { fontSize: 14, bold: true, color: COLORS.textNavy } }
  ], {
    x: 1.1, y: posY + 0.2, w: 11.13, h: 1.08,
    valign: "top", fontFace: "Segoe UI", lineSpacing: 16, margin: 0
  });
});

// -------------------------------------------------------------
// SLIDE 8: Conclusion
// -------------------------------------------------------------
const slide8 = pptx.addSlide();
slide8.background = { color: COLORS.bgSlide };

slide8.addShape(pptx.shapes.RECTANGLE, {
  x: 0, y: 0, w: 13.33, h: 0.15,
  fill: { color: COLORS.accentBlue }
});

slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 1.5, y: 1.2, w: 10.33, h: 5.2,
  fill: { color: COLORS.bgCard },
  line: { color: COLORS.accentBlue, width: 2 },
  rectRadius: 0.2
});

slide8.addText("THANK YOU!", {
  x: 2.0, y: 1.7, w: 9.33, h: 0.9,
  align: "center", fontSize: 52, bold: true, color: COLORS.accentBlue, fontFace: "Segoe UI"
});

slide8.addText("Designing Safe, Reliable & Efficient Power Systems", {
  x: 2.0, y: 2.7, w: 9.33, h: 0.5,
  align: "center", fontSize: 19, bold: true, color: COLORS.textNavy, fontFace: "Segoe UI"
});

slide8.addShape(pptx.shapes.LINE, {
  x: 4.5, y: 3.4, w: 4.33, h: 0,
  line: { color: COLORS.borderLight, width: 1.5 }
});

slide8.addText([
  { text: "Ahmed Ayoub\n\n", options: { bold: true, color: COLORS.textNavy, fontSize: 22 } },
  { text: "Tanta University — Faculty of Engineering\n", options: { color: COLORS.accentBlue, fontSize: 15, bold: true } },
  { text: "Electrical Power Engineering Department", options: { color: COLORS.textGray, fontSize: 15, bold: true } }
], {
  x: 2.0, y: 3.7, w: 9.33, h: 2.4,
  align: "center", fontFace: "Segoe UI", lineSpacing: 20, margin: 0
});

// Save PPTX
const outputPath = path.join(__dirname, "..", "Ahmed_Ayoub_Presentation.pptx");
pptx.writeFile({ fileName: outputPath }).then(fileName => {
  console.log(`Successfully generated PPTX file at: ${fileName}`);
}).catch(err => {
  console.error("Error generating PPTX:", err);
});
