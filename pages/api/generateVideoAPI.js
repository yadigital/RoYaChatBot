const generate_url = "https://api.d-id.com/talks";
const DID_KEY = process.env.NEXT_PUBLIC_DID_KEY;
const VOICE_ID = "en-US-ChristopherNeural";
const EXPRESSION = "happy";
const LOCAL_KEY = process.env.NEXT_PUBLIC_LOCAL_KEY;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { api_key, text } = req.body;

    if (api_key !== LOCAL_KEY) {
      res.status(401).json({ error: "not authorized" });
      return;
    }

    const payload = JSON.stringify({
      script: {
        type: "text",
        subtitles: "false",
        provider: {
          type: "microsoft",
          voice_id: VOICE_ID,
        },
        ssml: "false",
        input: text,
      },
      config: {
        fluent: true,
        pad_audio: 0.2,
        stitch: true,
        driver_expressions: {
          expressions: [
            {
              expression: EXPRESSION,
              start_frame: 0,
              intensity: 0.5,
            },
          ],
        },
      },
      source_url: // my photo
        "https://create-images-results.d-id.com/auth0%7C64c07418f38f4edf010d94b7/upl_mCgPnzPAfr3QVxrDyzmNp/image.png",
    });

    console.log(payload);

    try {
      const response = await fetch(generate_url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${DID_KEY}`,
          "Content-Type": "application/json",
          Accept: "*/*",
          Connection: "keep-alive",
        },
        body: payload,
      });

      console.log('generating video in the row');

      response
        .json()
        .then((data) => {
          console.log(data);
          res.status(200).json({ response: data });
        })
        .catch((err) => {
          res.status(500).json({ error: err });
        });
    }

    catch (e) {
      console.error(e);
      res.status(500).json({ error: e });
    }

  } else {
    res.status(404).json({ error: "Not found" });
  }
}
