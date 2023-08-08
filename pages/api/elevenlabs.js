import textToSpeech from "elevenlabs-api";
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API;
const LOCAL_KEY = process.env.NEXT_PUBLIC_LOCAL_KEY;
const VOICE_ID = "K8BZzqq0ilZRMgNq0u05";
const EXPIRE_DAYS = process.env.NEXT_PUBLIC_EXPIRE_DAYS;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function deleteOldFiles() {

  // create directory if does not exist
  if (!fs.existsSync("./public/resp")) {
    fs.mkdirSync("./public/resp");
  }
  // -------------------------------------

  const folderPath = path.join(process.cwd(), "public", "resp");
  const files = fs.readdirSync("./public/resp");

  const currentDate = new Date();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - EXPIRE_DAYS);

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    const fileModifiedTime = new Date(fileStats.mtime);

    if (fileModifiedTime < twoDaysAgo) {
      fs.unlinkSync(filePath);
    }
  });
};

/*export default async function handler(req, res) {
  if (req.method === "POST") {
    const timestamp = new Date().getTime();
    const filename = `public/resp/r_${timestamp.toFixed(0)}.mp3`;

    let message = req.body.messages;
    let key = req.body.key;

    await deleteOldFiles();

    if (key !== LOCAL_KEY) {
      res.status(404).json({ error: "Access denied" });
      return;
    }

    if (message.length == 0) {
      res.status(404).json({ error: "Empty message" });
      return;
    }

    try {
      textToSpeech(API_KEY, message, VOICE_ID, filename).then(
        async (response) => {
          // add short delay to be sure it finish writing in file
          // await delay(1500);
          console.log(`Success, Audio saved as: ${filename}`);
          res.status(200).json({ error: null, response: timestamp.toFixed(0) });
        }
      );
    } catch (error) {
      console.error(
        `An error occurred while converting text to speech: ${error}`
      );
    }
  } else {
    res.status(404).json({ error: "Not found" });
  }
}*/

export default async function handler(req, res) {
  // allow only POST method
  if (req.method === "POST") {
    // add error handling in case we have any problems with the filesystem
    try {
      // get the current timestamp
      const timestamp = new Date().getTime();
      const filename = `public/resp/r_${timestamp.toFixed(0)}.mp3`;

      // get the message and key from the request body
      const { message, key } = req.body;

      // delete old files
      await deleteOldFiles();

      // check if the key is valid
      if (key !== LOCAL_KEY) {
        res.status(404).json({ error: "Access denied" });
        return;
      }

      // check if the message is empty
      if (message.length == 0) {
        res.status(404).json({ error: "Empty message" });
        return;
      }

      try {
        // call the API to convert text to speech
        textToSpeech(API_KEY, message, VOICE_ID, filename).then(  // after the conversion is done return the filename
          async (response) => {
            res
              .status(200)
              .json({ error: null, response: timestamp.toFixed(0) });
          }
        );
      } catch (error) {
        console.error(
          `An error occurred while converting text to speech: ${error}`
        );
      }
    } catch (error) {
      console.error(
        `An error occurred while converting text to speech: ${error}`
      );
      res
        .status(404)
        .json({ error: "An error occurred while converting text to speech" });
    }
  } else {
    res.status(404).json({ error: "Not found" });
  }
}
