Project images live here, one folder per project slug (the `slug` in `src/content/data.ts`).

## Cards still showing "Screenshot coming soon"

Create the folder and drop in one file named `cover` (`.jpg`, `.png` or `.webp`). The card picks it up automatically on the next build; no code change needed.

| Project | File to add |
| --- | --- |
| MoodBites | `moodbites/cover.jpg` |
| GI Tract Segmentation | `gi-tract-segmentation/cover.jpg` |
| Efficient Water Quality Analysis | `water-quality-analysis/cover.jpg` |
| Twitter Sentiment Analysis | `twitter-sentiment-analysis/cover.jpg` |
| Charity Donation Website | `charity-donation-website/cover.jpg` |

Best results: a landscape screenshot around 16:11 (for example 1600 × 1100 px), at least 1200 px wide, under about 500 KB. The card crops to fill, so keep the important part near the centre.

## Projects with a case study

`siri-core-modeling`, `pitchpulse`, `barterbrain`, `historical-event-narrator`, `face-cloaking` and `coding-problem-recommender` use `cover.jpg` plus `slide-1.jpg`, `slide-2.jpg`, … listed in their `gallery` in `src/content/data.ts`.
