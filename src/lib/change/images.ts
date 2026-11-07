import type { ImageSourcePropType } from "react-native";

// Every picture in the "I noticed a change" screens lives in assets/change/.
// To use the Figma originals, export each one and overwrite the file with the SAME NAME (PNG).
// Nothing else needs to change. Names: feeling-*, symptom-*, chip-*, intro-illustration, result-illustration, video-thumbnail.

export const CHANGE_IMAGES = {
  introIllustration: require("../../../assets/change/intro-illustration.png"),
  resultIllustration: require("../../../assets/change/result-illustration.png"),
  videoThumbnail: require("../../../assets/change/video-thumbnail.png"),
  feeling: {
    "lump": require("../../../assets/change/feeling-lump.png"),
    "pain": require("../../../assets/change/feeling-pain.png"),
    "skin-change": require("../../../assets/change/feeling-skin-change.png"),
    "nipple-change": require("../../../assets/change/feeling-nipple-change.png"),
  } as Record<string, ImageSourcePropType>,
  symptom: {
    lump: require("../../../assets/change/symptom-lump.png"),
    skin: require("../../../assets/change/symptom-skin.png"),
    colour: require("../../../assets/change/symptom-colour.png"),
    nipple: require("../../../assets/change/symptom-nipple.png"),
    rash: require("../../../assets/change/symptom-rash.png"),
    liquid: require("../../../assets/change/symptom-liquid.png"),
  } as Record<string, ImageSourcePropType>,
  chip: {
    "1-3-months": require("../../../assets/change/chip-1-3-months.png"),
    "3-6-months": require("../../../assets/change/chip-3-6-months.png"),
    "body-aches": require("../../../assets/change/chip-body-aches.png"),
    "both-breasts": require("../../../assets/change/chip-both-breasts.png"),
    "chest": require("../../../assets/change/chip-chest.png"),
    "collarbone": require("../../../assets/change/chip-collarbone.png"),
    "comes-and-goes": require("../../../assets/change/chip-comes-and-goes.png"),
    "cramps": require("../../../assets/change/chip-cramps.png"),
    "diarrhea": require("../../../assets/change/chip-diarrhea.png"),
    "dimpling": require("../../../assets/change/chip-dimpling.png"),
    "getting-better": require("../../../assets/change/chip-getting-better.png"),
    "getting-worse": require("../../../assets/change/chip-getting-worse.png"),
    "growing-veins": require("../../../assets/change/chip-growing-veins.png"),
    "hard-lump": require("../../../assets/change/chip-hard-lump.png"),
    "headaches": require("../../../assets/change/chip-headaches.png"),
    "last-few-days": require("../../../assets/change/chip-last-few-days.png"),
    "last-few-weeks": require("../../../assets/change/chip-last-few-weeks.png"),
    "left-breast": require("../../../assets/change/chip-left-breast.png"),
    "mood-swings": require("../../../assets/change/chip-mood-swings.png"),
    "more-than-6-months": require("../../../assets/change/chip-more-than-6-months.png"),
    "new-fluid": require("../../../assets/change/chip-new-fluid.png"),
    "new-shape-or-size": require("../../../assets/change/chip-new-shape-or-size.png"),
    "nipple": require("../../../assets/change/chip-nipple.png"),
    "nipple-crust": require("../../../assets/change/chip-nipple-crust.png"),
    "not-sure": require("../../../assets/change/chip-not-sure.png"),
    "not-sure2": require("../../../assets/change/chip-not-sure2.png"),
    "orange-peel-skin": require("../../../assets/change/chip-orange-peel-skin.png"),
    "red-or-hot-nipple": require("../../../assets/change/chip-red-or-hot-nipple.png"),
    "right-breast": require("../../../assets/change/chip-right-breast.png"),
    "skin-change": require("../../../assets/change/chip-skin-change.png"),
    "skin-redness": require("../../../assets/change/chip-skin-redness.png"),
    "staying-the-same": require("../../../assets/change/chip-staying-the-same.png"),
    "thick-area": require("../../../assets/change/chip-thick-area.png"),
    "underarm": require("../../../assets/change/chip-underarm.png"),
    "unusual-discharge": require("../../../assets/change/chip-unusual-discharge.png"),
  } as Record<string, ImageSourcePropType>,
};

export const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
