import { MdOpenInBrowser as WebsiteIcon } from "react-icons/md";
import {
  SiWikipedia as WikipediaIcon,
  SiEpicgames as EpicgamesIcon,
  SiGogdotcom as GogIcon,
} from "react-icons/si";
import {
  FaFacebookF as FacebookIcon,
  FaTwitter as TwitterIcon,
  FaInstagram as InstagramIcon,
  FaTwitch as TwitchIcon,
  FaYoutube as YoutubeIcon,
  FaSteam as SteamIcon,
  FaRedditAlien as RedditIcon,
  FaDiscord as DiscordIcon,
} from "react-icons/fa";
import type { WebsiteModel } from "src/models/GameModel";
import { Grid } from "@mui/material";
import IconButton from "@/ui/components/IconButton";

export const websiteIcons = {
  "1": WebsiteIcon,
  // 2 Wikia Icon ???
  "3": WikipediaIcon,
  "4": FacebookIcon,
  "5": TwitterIcon,
  "6": TwitchIcon,
  "8": InstagramIcon,
  "9": YoutubeIcon,
  "13": SteamIcon,
  "14": RedditIcon,
  "16": EpicgamesIcon,
  "17": GogIcon,
  "18": DiscordIcon,
};

export default function WebsiteItem(props: WebsiteModel) {
  const { trusted, category, url, hash } = props;

  // @ts-ignore
  const Icon = websiteIcons[category];

  return (
    <Grid item xs={1}>
      <IconButton
        color="secondary"
        size="large"
        // sx={{ color: (theme) => theme.palette.text.secondary }}
      >
        <Icon fontSize={22} />
      </IconButton>
    </Grid>
  );
}
