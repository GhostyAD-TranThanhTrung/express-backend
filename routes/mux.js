const express = require("express");
const Mux = require("@mux/mux-node");

const router = express.Router();

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
});

router.post("/live-streams", async (req, res, next) => {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
        return res.status(500).json({ error: "Mux credentials not configured" });
    }

    try {
        const stream = await mux.video.liveStreams.create({
            playback_policies: ["public"],
            new_asset_settings: { playback_policies: ["public"] },
            test: true,
        });

        return res.status(201).json({
            id: stream.id,
            streamKey: stream.stream_key,
            playbackId: stream.playback_ids?.[0]?.id || null,
            rtmpsUrl: stream.rtmps?.url || null,
        });
    } catch (error) {
        return next(error);
    }
});

router.get("/health", (req, res) => {
    return res.status(200).json({ ok: true });
});

module.exports = router;
