import { ExtensionWebExports } from "@moonlight-mod/types";

export const webpackModules: ExtensionWebExports["webpackModules"] = {
  presence: {
    dependencies: [
      { ext: "spacepack", id: "spacepack" },
      { id: "discord/Dispatcher" },
      { id: "discord/Constants" },
      { id: "discord/utils/HTTPUtils" },
    ],
    entrypoint: true
  }
};
