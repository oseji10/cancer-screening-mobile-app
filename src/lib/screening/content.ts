// Screening guide content. Copy comes from the Figma screens; a few obvious typos were fixed.
export type Step = { title: string; body?: string; bullets?: string[] };
export type Tab = { key: "before" | "say" | "how"; label: string; steps: Step[] };
export type Tone = { bg: string; soft: string; circle: string; dot: string; tab: string };
export type Modality = {
  id: "cbe" | "mammogram" | "ultrasound" | "mri" | "biopsy";
  appbar: string;
  heading: string;
  blurb: string;
  chips: string[];
  tone: Tone;
  cta: string;
  hubTitle: string;
  tabs: Tab[];
};

export const MODALITIES: Modality[] = [
  {
    "id": "cbe",
    "appbar": "Clinical Breast Examination",
    "heading": "Clinical breast exam",
    "blurb": "When you go for a clinical Breast examination or a CBE a hospital staff checks your breast and underarms for changes",
    "chips": [
      "10 min",
      "Any age"
    ],
    "tone": {
      "bg": "#E9E3FB",
      "soft": "#EEEBFA",
      "circle": "#F3F0FD",
      "dot": "#7C5CE0",
      "tab": "#E4DDFA"
    },
    "cta": "Book a check-up",
    "hubTitle": "Clinical Breast examination",
    "tabs": [
      {
        "key": "before",
        "label": "Before you go",
        "steps": [
          {
            "title": "Nothing to prepare",
            "body": "There is no need to fast or be hungry, it's different from a blood sugar test. So ensure that you eat before going",
                      },
          {
            "title": "Wear something easy to remove",
            "body": "You'll undress from the waist up, so a separate top is better than a gown",
                      },
          {
            "title": "Do not wear deodorant, powders or lotions",
            "body": "This can look different when you are doing your exams",
                      },
          {
            "title": "Book it when your breasts are not so tender",
            "body": "A few days after your period your breasts are less tender. Book then",
                      }
        ]
      },
      {
        "key": "say",
        "label": "What to say",
        "steps": [
          {
            "title": "How long it has been there",
            "body": "Tell your doctor that you noticed a change in your breast and you have noticed it for some day, week or month",
                      },
          {
            "title": "Where it is located",
            "body": "Is it near the nipple, in the right breast, left breast or around the chest, you can also use a marker to draw an X on the location where the lump is.",
                      },
          {
            "title": "What is the change",
            "body": "Take your change tracker during your appointments and share that with the person doing the exam",
                      },
          {
            "title": "Talk about your testing options",
            "body": "If you are still unsure tell your doctor that you would like to do one of the other screening options that is available to you",
                      }
        ]
      }
    ]
  },
  {
    "id": "mammogram",
    "appbar": "Mammography",
    "heading": "Mammogram",
    "blurb": "Mammography is an X-ray test of the breast. It helps find breast cancer early, sometimes before a lump can be seen or felt.",
    "chips": [
      "20 min",
      "Age 40+"
    ],
    "tone": {
      "bg": "#F9CDDC",
      "soft": "#FBE3EB",
      "circle": "#FCE7EE",
      "dot": "#FF5CAA",
      "tab": "#FADCE6"
    },
    "cta": "Book a mammogram",
    "hubTitle": "Mammogram",
    "tabs": [
      {
        "key": "before",
        "label": "Before you go",
        "steps": [
          {
            "title": "When you should ask about it",
                        "bullets": [
              "Age 40–55: Ask about a mammogram every year.",
              "Age 56–74: Ask about a mammogram every 2 years.",
              "Any age: If you notice a new lump, breast swelling, skin or nipple changes, or unusual nipple discharge, see a health worker promptly. Do not wait until you are 40"
            ]
          },
          {
            "title": "Skip deodorant that morning",
            "body": "Deodorant, antiperspirant, talc and body lotion can leave specks that show up on the image and can be mistaken for something else.",
                      },
          {
            "title": "Time it with your cycle",
            "body": "If you still have periods, book the week **after** yours ends. Breasts are least tender then, which makes the compression easier to tolerate.",
                      },
          {
            "title": "Tell them what's changed",
            "body": "Mention anything you've noticed, plus any past breast surgery, implants or family history.",
                      }
        ]
      },
      {
        "key": "how",
        "label": "How it works",
        "steps": [
          {
            "title": "You get changed",
            "body": "A private cubicle, and a gown that opens at the front. Only you and the technician are in the room.",
                      },
          {
            "title": "One breast at a time",
            "body": "You stand at the machine. The technician positions your breast on a flat plate and adjusts your shoulder and arm.",
                      },
          {
            "title": "A few seconds of pressure",
            "body": "A second plate presses down to flatten the tissue. It's tight and can be uncomfortable, but it lasts only seconds and gives a clearer image at a lower dose.",
                      },
          {
            "title": "Two angles, each side",
            "body": "Usually top-to-bottom and side-to-side, so four images in total. You'll be asked to hold still and hold your breath briefly.",
                      },
          {
            "title": "Then you're done",
            "body": "You dress and leave. No recovery, no after-effects. Some tenderness for a day is normal.",
                      },
          {
            "title": "Results come later",
            "body": "A specialist reads the images afterwards, not on the day. Ask at reception how and when you'll hear.",
                      }
        ]
      }
    ]
  },
  {
    "id": "ultrasound",
    "appbar": "Ultrasound",
    "heading": "Ultrasound",
    "blurb": "Sometimes, after checking your breast, a doctor may want to look more closely at what is happening inside the breast. They may ask you to have a breast ultrasound.",
    "chips": [
      "20 min",
      "Any age"
    ],
    "tone": {
      "bg": "#C5ECE3",
      "soft": "#E2F5F0",
      "circle": "#EAF8F4",
      "dot": "#4CC9B0",
      "tab": "#D5F1EA"
    },
    "cta": "Ask about an ultrasound",
    "hubTitle": "Breast Ultrasound",
    "tabs": [
      {
        "key": "before",
        "label": "Before you go",
        "steps": [
          {
            "title": "Nothing to prepare",
            "body": "No fasting, no restrictions, and deodorant is fine. Unlike a mammogram, nothing you put on your skin affects the image.",
                      },
          {
            "title": "Wear two pieces",
            "body": "You'll undress from the waist up and lie down, so a separate top is easier.",
                      },
          {
            "title": "No need to plan around your cycle",
            "body": "There's no compression, so timing doesn't matter. You can book whenever suits you.",
                      },
          {
            "title": "Know why you're having it",
            "body": "An ultrasound is usually done to look more closely at something specific, or because dense tissue makes an X-ray harder to read.",
                      }
        ]
      },
      {
        "key": "how",
        "label": "How it works",
        "steps": [
          {
            "title": "You lie down",
            "body": "On a bed, usually on your back with the arm on that side raised above your head. This flattens the tissue evenly.",
                      },
          {
            "title": "The health worker puts gel on you",
            "body": "A clear gel is spread over the skin so the probe makes proper contact. It's usually warmed, and it wipes off afterwards.",
                      },
          {
            "title": "A handheld probe moves over the skin",
            "body": "Firm but gentle pressure, back and forth across the breast. No radiation and no compression. Most people find it painless.",
                      },
          {
            "title": "The armpit is checked too",
            "body": "Lymph nodes near the armpit are part of the same picture, so the probe will move up there as well.",
                      },
          {
            "title": "Images appear as it happens",
            "body": "The screen shows the scan live. You may see it, though the shapes are hard to interpret without training.",
                      },
          {
            "title": "Then you're done",
            "body": "Gel wiped off, dressed, no after-effects. Ask before you leave how and when you'll get results — some clinics discuss them the same day, others don't.",
                      }
        ]
      }
    ]
  },
  {
    "id": "mri",
    "appbar": "Breast MRI",
    "heading": "MRI",
    "blurb": "Sometimes, a doctor may need a clearer picture of the breast to understand what is happening. They may ask you to have a breast MRI.",
    "chips": [
      "45 min",
      "By referral"
    ],
    "tone": {
      "bg": "#F9CDDC",
      "soft": "#FBE3EB",
      "circle": "#FCE7EE",
      "dot": "#D63A8F",
      "tab": "#FADCE6"
    },
    "cta": "Ask about an MRI",
    "hubTitle": "Breast MRI",
    "tabs": [
      {
        "key": "before",
        "label": "Before you go",
        "steps": [
          {
            "title": "Tell them about any metal",
            "body": "An MRI uses a strong magnet. Anything metal in your body must be declared well before the day, not on arrival. This includes metal implants, past surgeries, and piercings",
                      },
          {
            "title": "Timing may be scheduled for you",
            "body": "If you still have periods, the clinic may book you for a particular week of your cycle, because natural hormone changes affect how breast tissue appears.",
                      },
          {
            "title": "There's usually an injection",
            "body": "Most breast MRIs use a contrast dye given through a small cannula in your arm, which makes tissue easier to distinguish. You may be asked about kidney function or allergies first.",
                      },
          {
            "title": "Say if enclosed spaces worry you",
            "body": "You'll be inside the scanner for a while. Tell them in advance, there are ways to make it manageable, and it's a common thing to raise.",
                      }
        ]
      },
      {
        "key": "how",
        "label": "How it works",
        "steps": [
          {
            "title": "Safety check, then change",
            "body": "You'll go through the metal questions again, remove jewellery and anything with metal, and change into a gown.",
                      },
          {
            "title": "A cannula goes in your arm",
            "body": "A thin tube, placed before you go in, so the contrast dye can be given partway through without moving you.",
                      },
          {
            "title": "You lie face down",
            "body": "On a padded table with two openings for your breasts to hang through, arms usually above your head. The table then slides into the scanner.",
                      },
          {
            "title": "It's loud",
            "body": "Knocking, banging and buzzing throughout — that's the machine working normally. You'll be given earplugs or headphones, and the staff can talk to you between sequences.",
                      },
          {
            "title": "The dye goes in partway through",
            "body": "You may feel a cool sensation or a metallic taste for a moment. Both are normal and pass quickly.",
                      },
          {
            "title": "Staying still is the main effort",
            "body": "The scan runs in blocks of a few minutes over roughly half an hour. Movement blurs the images, so it's the one thing that really matters.",
                      },
          {
            "title": "Afterwards",
            "body": "The cannula comes out and you can go straight home. Drinking water helps clear the dye. A radiologist reads the images later, results are never given on the day.",
                      }
        ]
      }
    ]
  },
  {
    id: "biopsy",
    appbar: "Biopsy",
    heading: "Biopsy",
    blurb: "A biopsy takes a tiny sample from the area your doctor is concerned about, so it can be looked at closely under a microscope. It is the only way to know for sure what is going on.",
    chips: ["30–60 min", "By referral"],
    tone: { bg: "#D3DEFA", soft: "#E8EEFC", circle: "#DDE6FB", dot: "#4C6FE0", tab: "#C9D6F8" },
    cta: "Ask about a biopsy",
    hubTitle: "Biopsy",
    tabs: [
      {
        key: "before",
        label: "Before you go",
        steps: [
          { title: "Know why you're having one", body: "A biopsy is how doctors find out exactly what a lump or an unclear scan result is. **Many biopsies show that nothing serious is happening.** Ask your doctor what they are looking for and when you'll hear back." },
          { title: "Tell them about your medicines", body: "Mention blood thinners (including aspirin), any other regular medicines, and any allergies, especially to local anaesthetic or plasters. Don't stop a medicine unless your doctor tells you to." },
          { title: "Dress comfortably and bring someone", body: "Wear a loose two-piece outfit that is easy to change out of. Bringing a friend or family member for company, and for the trip home, is a good idea." },
          { title: "Ask which type you'll have", body: "Most breast biopsies use a thin needle, done while the area is numbed, and take under an hour. Ask what to expect, how long it takes, and whether you can eat beforehand." }
        ]
      },
      {
        key: "how",
        label: "How it works",
        steps: [
          { title: "Check in and change", body: "Staff confirm your name, your details and the area being checked, explain the steps and ask for your consent. You'll then change into a gown." },
          { title: "A scan guides the needle", body: "Usually an ultrasound, sometimes a mammogram, is used so the doctor can see exactly where to take the sample from." },
          { title: "The area is numbed", body: "A small injection of local anaesthetic numbs the skin and breast tissue. It stings for a few seconds, then the area goes numb." },
          { title: "The sample is taken", body: "A thin needle collects a few tiny pieces of tissue. You may hear a click and feel some pressure, but it shouldn't hurt. A tiny marker is sometimes left in place so the spot can be found again." },
          { title: "Pressure and a dressing", body: "The doctor presses on the area for a few minutes to stop any bleeding, then covers it with a small dressing. An ice pack can ease soreness." },
          { title: "The sample goes to the lab", body: "A specialist doctor called a pathologist studies the tissue under a microscope. Your result is sent to your doctor, not given on the day." },
          { title: "Afterwards and your results", body: "Some bruising and soreness for a few days is normal, and a simple pain reliever such as paracetamol usually helps. Avoid heavy lifting for a day. Results often take several days to a couple of weeks, so ask when you'll be called back. **Contact the clinic if you have heavy bleeding, increasing swelling, redness, or a fever.**" }
        ]
      }
    ]
  }
];

export const BARRIERS = [
  "I don't know where to go",
  "I don't know what happens",
  "I am worried about the cost",
  "I am worried about what they would find",
  "I can't find the time",
  "My family would not agree",
  "I do not have any issues with screening"
];
/** The last option clears the others. */
export const NO_ISSUES = BARRIERS.length - 1;

export const findModality = (id?: string) => MODALITIES.find((m) => m.id === id);

export const HUB_GROUPS = [
  { question: "Do you have a symptom?", ids: ["cbe", "mammogram"] },
  { question: "Need another look?", ids: ["ultrasound", "mri"] },
  { question: "Still a concern?", ids: ["biopsy"] },
] as const;
