# Adding Custom Screen Resolution Maps

To add a custom screen resolution map to the landmarks module, follow these steps:

1. **Create a New Directory:**
   Create a new directory under `packages/automation/src/landmarks/maps/` with the name in the format of `<numerator>x<divisor>` representing the reduced fraction of your screen resolution. For example, a screen resolution of `1920x1200` would simplify to `8x5`.
   Inside this new directory, copy the files from a similar screen resolution to start with.

2. **Take a Screenshot**
   Open the game at the intended resolution. **Note** if you change the resolution you should close and re-open the game to make sure all the UI elements are reset to the correct positions.
   Replace the `screenshot.png` image with your screenshot.

3. **Edit the SVG Map File:**
   You will now need to edit the svg so that the elements match the screenshot. I use the free program Inkscape to do this.
   ![Screenshot 2024-01-06 123205](https://github.com/Jugbot/genshin-locker/assets/5402388/e4b8c84f-820b-44c8-8a59-699d94a73863)
   **Important** make sure that all the boxes are expressed using x,y,width,height and not transforms. If you see something like `transform="matrix(0.95898827,0,0,0.9552798,6.4456015,7.1979077)">` in your diff you probably messed up.
   Things like style/grouping does not matter. The label of the elements do matter however.
   When you are done, just save the file.

4. **Update the Main Index File:**
   Update the `packages/automation/src/landmarks/maps/index.ts` file to include your new custom resolution map.

Then make sure to test that the scraper works. If something goes wrong, things might not be aligned properly or you did something to an element that is not supported by the scraper e.g. css/transform.
