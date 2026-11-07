import { ImageSourcePropType } from "react-native";

export type LessonSlide = {
  title: string;
  /** Plain text; wrap a word in ** to bold it, e.g. "This is called **intertrigo**". */
  body: string;
  image: ImageSourcePropType;
  /** Shows the coral play button on the image (the Figma diagram slide has one). */
  playable?: boolean;
  /** Video that opens when the play button is tapped (needs `playable`). */
  video?: number;
};

export type LessonTopic = {
  id: string;
  title: string;
  /** Card colours on the Learn screen: [background, decoration]. */
  bg: string;
  decor: string;
  slides: LessonSlide[];
};

// Only "Breast health" has lesson content in Figma so far. The other five topics
// open a "coming soon" lesson until their slides are added here.
export const TOPICS: LessonTopic[] = [
  {
    id: "breast-health",
    title: "Breast health",
    bg: "#F5F1FF",
    decor: "#E8E0FC",
    slides: [
      {
        title: "Breasts are made up of lobules, ducts, and tissue that gives the breasts their size and shape.",
        body: "Lobules are glands that produce milk to feed a baby. Ducts are tubes that carry breast milk to the nipple, ready for breastfeeding.",
        image: require("../../../assets/learn/breast-anatomy.png"),
        playable: true,
        video: require("../../../assets/videos/breast-anatomy.mp4"),
      },
      {
        title: "Breasts are made up of lobules and ducts, and tissue that gives the breasts their size and shape.",
        body: "The nipple is surrounded by a darker area of skin called the areola. On the areola there are some small raised bumps which produce fluid to moisturise the nipple.",
        image: require("../../../assets/learn/nipple-areola.png"),
      },
      {
        title: "Breast changes happen naturally as the body change throughout life.",
        body: "Breasts can change from puberty through the childbearing years and into menopause, and some changes may be caused by a benign (not cancer) breast condition.",
        image: require("../../../assets/learn/changes-naturally.png"),
      },
      {
        title: "Breasts can change before and during your period",
        body: "Before your period, your breasts may feel heavier, fuller, tender or lumpy, but these changes usually lessen or go away after your period. Some women may have tender or lumpy breasts all the time.",
        image: require("../../../assets/learn/period.png"),
      },
      {
        title: "Breast pain is common and is usually not a sign of breast cancer.",
        body: "Many women have sore or tender breasts around their period, and breast pain does not increase the risk of breast cancer. Keep track of your pain to spot any pattern,",
        image: require("../../../assets/learn/pain.png"),
      },
      {
        title: "Soreness under the breasts is common and is often caused by skin rubbing and trapped moisture.",
        body: "This is called **intertrigo** and can sometimes lead to an infection from yeast, fungus or bacteria. To help prevent it, wash and dry under your breasts twice a day, wear a well-fitting cotton bra, and try to keep a healthy weight for you.",
        image: require("../../../assets/learn/soreness.png"),
      },
      {
        title: "Breast lumps can have different causes, and most are not cancer",
        body: "Common causes include breast cysts, which are fluid-filled sacs, and fibroadenomas, which often develop during puberty. It is important to see your doctor about any new breast lump because, in some cases, a lump can be a sign of cancer.",
        image: require("../../../assets/learn/lumps.png"),
      },
    ],
  },
  { id: "what-to-look-for", title: "What to look for", bg: "#CAFFFC", decor: "#A8F3EE", slides: [] },
  { id: "what-to-feel-for", title: "What to feel for", bg: "#FFD7DE", decor: "#F8BCC8", slides: [] },
  { id: "how-to-check", title: "How to Check", bg: "#F5F1FF", decor: "#E8E0FC", slides: [] },
  { id: "when-to-check", title: "When to Check", bg: "#CAFFFC", decor: "#A8F3EE", slides: [] },
  { id: "what-are-my-risk", title: "What are my Risk?", bg: "#FFD7DE", decor: "#F8BCC8", slides: [] },
];

export function findTopic(id: string | undefined): LessonTopic | undefined {
  return TOPICS.find((topic) => topic.id === id);
}
