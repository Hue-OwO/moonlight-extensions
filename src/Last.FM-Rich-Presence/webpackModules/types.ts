export enum ActivityTypes {
    PLAYING,
    STREAMING,
    LISTENING,
    WATCHING,
    CUSTOM_STATUS,
    COMPETING,
    HANG_STATUS
  }
export type api = {
    uri: string,
    lastfmApiKey: string,
    lastfmUsername: string
}
export type track = {
    mbid: string,
    track: {
        name: string
    }
    artist: {
        name: string
    },
    album: {
        name: string
    },
    image: {
      url: string
    }
}

export type Activity = {
    application_id?: string;
    name: string;
    type: ActivityTypes;
    details: string;
    state?: string;
    assets?: {
      large_image?: string;
      large_text?: string;
      small_image?: string;
      small_text?: string;
    };
    party?: {
      id?: string;
      size: [number, number];
    };
    sync_id?: string;
    buttons?: string[];
    metadata?: {
      button_urls?: string[];
      artist_ids?: string[];
      album_id?: string;
    };
    timestamps?: {
      start?: number;
      end?: number;
    };
  };