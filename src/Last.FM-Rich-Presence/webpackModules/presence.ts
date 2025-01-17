const logger = moonlight.getLogger("LastFM/presence");
import Dispatcher from "@moonlight-mod/wp/discord/Dispatcher";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
const { Endpoints } = spacepack.require("discord/Constants");

import { type track, api, ActivityTypes, Activity } from "./types";
import { HTTP } from "@moonlight-mod/wp/discord/utils/HTTPUtils";

const application: string = moonlight.getConfigOption("LastFM", "DiscordAppId") || "";

const lastfmApi: api = {
  uri: "https://ws.audioscrobbler.com/2.0",
  lastfmApiKey: moonlight.getConfigOption("LastFM", "lastFMApiKey") ?? "",
  lastfmUsername: moonlight.getConfigOption("LastFM", "lastFMUsername") ?? ""
};

let lastTrackId: string | undefined;
const interval: number = moonlight.getConfigOption("LastFM", "lastFMInterval") ?? 15000;

function setActivity(activity?: Activity) {
  Dispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    socketId: "LastFM_presence",
    activity
  });
}

async function LastFM() {
  try {
    const response = await fetch(
      `${lastfmApi.uri}/?` +
        new URLSearchParams({
          user: lastfmApi.lastfmUsername,
          method: "user.getrecenttracks",
          format: "json",
          api_key: lastfmApi.lastfmApiKey,
          limit: "1"
        })
    );

    if (!response.ok) {
      logger.error(`LastFM rror: ${response.statusText}`);
      return;
    }

    const resJson = await response.json();
    const nowPlaying = resJson?.recenttracks?.track?.[0];

    if (nowPlaying && nowPlaying["@attr"]?.nowplaying === "true") {
      const currentTrack: track = {
        mbid: nowPlaying.album.mbid || nowPlaying.mbid,
        track: { name: nowPlaying.name },
        artist: { name: nowPlaying.artist["#text"] },
        album: { name: nowPlaying.album["#text"] },
        image: {
          url: nowPlaying.image?.[nowPlaying.image.length - 1]?.["#text"]?.startsWith("http")
             ? nowPlaying.image[nowPlaying.image.length - 1]["#text"]
             : "https://raw.githubusercontent.com/Hue-OwO/last.fm-moonlight/refs/heads/main/images/blank.png",
        }
      };
      let trackImage = currentTrack.image.url

      if(trackImage) {
        if (trackImage.startsWith("http") && application !== "") {
          try {
            const { body } = await HTTP.post({
              url: Endpoints.APPLICATION_EXTERNAL_ASSETS(application),
              body: {
                 urls: [trackImage]
              },
            })
            trackImage = "mp:" + body[0].external_asset_path;
          } catch (err) {
            logger.error("Failed to push external assets:", err);
          }
        } 
      }

      const nowPlayingData: Activity = {
        application_id: application,
        name: "music",
        type: ActivityTypes.LISTENING,
        details: currentTrack.track.name,
        state: currentTrack.artist.name,
        assets: {
          large_text: currentTrack.album.name && currentTrack.album.name !== currentTrack.track.name
                      ? currentTrack.album.name
                      : currentTrack.track.name,
          large_image: trackImage
        }
      };

      setActivity(nowPlayingData);
    } else {
      if (lastTrackId) {
        lastTrackId = undefined;
        setActivity();
      }
    }
  } catch (error) {
    logger.error("LastFM Error: ", error);
  } finally {
    setTimeout(LastFM, interval);
  }
}

LastFM()
