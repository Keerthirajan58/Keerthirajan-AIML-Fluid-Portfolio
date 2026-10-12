import type { Project } from "../types";
import { siriCoreModeling } from "./siri-core-modeling";
import { barterbrain } from "./barterbrain";
import { barterbrainNvc } from "./barterbrain-nvc";
import { pitchpulse } from "./pitchpulse";
import { historicalEventNarrator } from "./historical-event-narrator";
import { codingProblemRecommender } from "./coding-problem-recommender";
import { faceCloaking } from "./face-cloaking";
import { moodbites } from "./moodbites";
import { giTractSegmentation } from "./gi-tract-segmentation";
import { waterQualityAnalysis } from "./water-quality-analysis";
import { twitterSentimentAnalysis } from "./twitter-sentiment-analysis";
import { charityDonationWebsite } from "./charity-donation-website";

/**
 * Every project, in display order: work cards follow this order, and a
 * project with a `chapter` appears as a link from the project it continues.
 * To add one, create a file next to these and list it here.
 */
export const projects: Project[] = [
  siriCoreModeling,
  barterbrain,
  barterbrainNvc,
  pitchpulse,
  historicalEventNarrator,
  codingProblemRecommender,
  faceCloaking,
  moodbites,
  giTractSegmentation,
  waterQualityAnalysis,
  twitterSentimentAnalysis,
  charityDonationWebsite,
];
