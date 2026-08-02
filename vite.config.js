import { defineConfig } from "vite";

export default defineConfig({
  /*
    Relative base so the production build works whether it's
    deployed at a domain root or under a GitHub Pages project
    subpath (e.g. username.github.io/repo-name/). Safe here
    because this is a single-page site with in-page anchor
    navigation only, no client-side routing.
  */
  base: "./",
});
