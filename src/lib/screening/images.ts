import type { ImageSourcePropType } from "react-native";
// Every picture in the screening screens lives in assets/screening/.
// To use the Figma originals, export each one as PNG and overwrite the file with the SAME NAME.
// Names: intro-illustration, hero-<id>, hub-<id>, barrier-<n>, step-<id>-<tab>-<n>.
export const SCREENING_IMAGES = {
  intro: require("../../../assets/screening/intro-illustration.png"),
  hero: {
    cbe: require("../../../assets/screening/hero-cbe.png"),
    mammogram: require("../../../assets/screening/hero-mammogram.png"),
    ultrasound: require("../../../assets/screening/hero-ultrasound.png"),
    mri: require("../../../assets/screening/hero-mri.png"),
    biopsy: require("../../../assets/screening/hero-biopsy.png"),
  } as Record<string, ImageSourcePropType>,
  hub: {
    cbe: require("../../../assets/screening/hub-cbe.png"),
    mammogram: require("../../../assets/screening/hub-mammogram.png"),
    ultrasound: require("../../../assets/screening/hub-ultrasound.png"),
    mri: require("../../../assets/screening/hub-mri.png"),
    biopsy: require("../../../assets/screening/hub-biopsy.png"),
  } as Record<string, ImageSourcePropType>,
  barrier: [
    require("../../../assets/screening/barrier-1.png"),
    require("../../../assets/screening/barrier-2.png"),
    require("../../../assets/screening/barrier-3.png"),
    require("../../../assets/screening/barrier-4.png"),
    require("../../../assets/screening/barrier-5.png"),
    require("../../../assets/screening/barrier-6.png"),
    require("../../../assets/screening/barrier-7.png"),
  ] as ImageSourcePropType[],
  step: {
    "cbe-before": [
      require("../../../assets/screening/step-cbe-before-1.png"),
      require("../../../assets/screening/step-cbe-before-2.png"),
      require("../../../assets/screening/step-cbe-before-3.png"),
      require("../../../assets/screening/step-cbe-before-4.png"),
    ],
    "cbe-say": [
      require("../../../assets/screening/step-cbe-say-1.png"),
      require("../../../assets/screening/step-cbe-say-2.png"),
      require("../../../assets/screening/step-cbe-say-3.png"),
      require("../../../assets/screening/step-cbe-say-4.png"),
    ],
    "mammogram-before": [
      require("../../../assets/screening/step-mammogram-before-1.png"),
      require("../../../assets/screening/step-mammogram-before-2.png"),
      require("../../../assets/screening/step-mammogram-before-3.png"),
      require("../../../assets/screening/step-mammogram-before-4.png"),
    ],
    "mammogram-how": [
      require("../../../assets/screening/step-mammogram-how-1.png"),
      require("../../../assets/screening/step-mammogram-how-2.png"),
      require("../../../assets/screening/step-mammogram-how-3.png"),
      require("../../../assets/screening/step-mammogram-how-4.png"),
      require("../../../assets/screening/step-mammogram-how-5.png"),
      require("../../../assets/screening/step-mammogram-how-6.png"),
    ],
    "ultrasound-before": [
      require("../../../assets/screening/step-ultrasound-before-1.png"),
      require("../../../assets/screening/step-ultrasound-before-2.png"),
      require("../../../assets/screening/step-ultrasound-before-3.png"),
      require("../../../assets/screening/step-ultrasound-before-4.png"),
    ],
    "ultrasound-how": [
      require("../../../assets/screening/step-ultrasound-how-1.png"),
      require("../../../assets/screening/step-ultrasound-how-2.png"),
      require("../../../assets/screening/step-ultrasound-how-3.png"),
      require("../../../assets/screening/step-ultrasound-how-4.png"),
      require("../../../assets/screening/step-ultrasound-how-5.png"),
      require("../../../assets/screening/step-ultrasound-how-6.png"),
    ],
    "mri-before": [
      require("../../../assets/screening/step-mri-before-1.png"),
      require("../../../assets/screening/step-mri-before-2.png"),
      require("../../../assets/screening/step-mri-before-3.png"),
      require("../../../assets/screening/step-mri-before-4.png"),
    ],
    "mri-how": [
      require("../../../assets/screening/step-mri-how-1.png"),
      require("../../../assets/screening/step-mri-how-2.png"),
      require("../../../assets/screening/step-mri-how-3.png"),
      require("../../../assets/screening/step-mri-how-4.png"),
      require("../../../assets/screening/step-mri-how-5.png"),
      require("../../../assets/screening/step-mri-how-6.png"),
      require("../../../assets/screening/step-mri-how-7.png"),
    ],
    "biopsy-before": [
      require("../../../assets/screening/step-biopsy-before-1.png"),
      require("../../../assets/screening/step-biopsy-before-2.png"),
      require("../../../assets/screening/step-biopsy-before-3.png"),
      require("../../../assets/screening/step-biopsy-before-4.png"),
    ],
    "biopsy-how": [
      require("../../../assets/screening/step-biopsy-how-1.png"),
      require("../../../assets/screening/step-biopsy-how-2.png"),
      require("../../../assets/screening/step-biopsy-how-3.png"),
      require("../../../assets/screening/step-biopsy-how-4.png"),
      require("../../../assets/screening/step-biopsy-how-5.png"),
      require("../../../assets/screening/step-biopsy-how-6.png"),
      require("../../../assets/screening/step-biopsy-how-7.png"),
    ],
  } as Record<string, ImageSourcePropType[]>,
};
