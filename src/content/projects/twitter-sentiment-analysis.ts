import type { Project } from "../types";

export const twitterSentimentAnalysis: Project = {
  slug: "twitter-sentiment-analysis",
  title: "Twitter Sentiment Analysis",
  badge: "Internship Project",
  description:
    "Real-time sentiment analysis web app for extracting product insights from Twitter data.",
  tags: ["Tweepy", "TextBlob", "Python", "Flask"],
  filters: ["aiml", "web"],
  notes: [
    {
      text: "The purpose of this project is to perform real-time sentiment analysis on Twitter data. Users can input either a Twitter username or a hashtag, and the application fetches relevant tweets using the Twitter API. By analyzing these tweets with TextBlob, it categorizes them as Positive, Negative, or Neutral and calculates the percentage for each sentiment. The insights can help businesses make data-driven decisions by understanding public sentiment.",
    },
    {
      meta: "Python, Tweepy, Textblob, Flask",
    },
    {
      text: "Due to confidentiality agreements with TCS, I cannot share specific details about the projects I worked on during my internship. However, I can provide the tech stacks that I used and the project description below.",
    },
  ],
};
