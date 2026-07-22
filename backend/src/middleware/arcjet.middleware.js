import aj from '../lib/arcjet.js';

import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 1 });

        if (decision.isDenied()) {
            if (decision.reason.isRatedLimit()) {
                return res.status(429).json({ msg: "Rate Limit Exceeded. Please try againn later" });
            }
            else if (decision.reason.isBot()) {
                return res.status(403).json({ msg: "Bot access denied." });
            } else {
                return res.status(403).json({ msg: "Access Denied by security policy." });
            }
        }

        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({ error: "Spoofed bot detected", msg: "Malicious bot activity detected." });
        }

        next();

    } catch (error) {
        console.log("Arcjet Protection Error:", error);
        next();
    }
}