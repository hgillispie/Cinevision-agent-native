import { createAuthPlugin } from "@agent-native/core/server";

export default createAuthPlugin({
  googleOnly: true,
  marketing: {
    appName: "CineVision Studio",
    tagline: "Internal AI workspace for vertical video operations.",
    features: [
      "Build internal tools with a conversational agent",
      "Connect data sources, APIs, and video pipelines",
      "Configure and extend your CineVision workflow",
    ],
  },
});
