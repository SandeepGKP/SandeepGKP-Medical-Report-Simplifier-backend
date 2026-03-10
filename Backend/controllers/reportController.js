const { extractText } = require('../utils/ocr');

async function processReport(req, res) {
    try {
        let isImage = false;
        let ocrConfidence = null;
        let text = "";

        if (req.files && req.files.length > 0) {

            const file = req.files[0];

            console.log("\n\nUploaded file:", file.originalname);
            console.log("Mime type:", file.mimetype);

            if (file.mimetype.startsWith("image/")) {

                isImage = true;

                const ocrResult = await extractText(file.buffer);

                text = ocrResult.text || "";
                ocrConfidence = ocrResult.confidence || null;

                console.log("OCR confidence:", ocrConfidence);

            } else if (file.mimetype.startsWith("text/")) {

                isImage = false;

                text = file.buffer.toString("utf-8");

            } else {

                return res.status(400).json({
                    status: "error",
                    message: "Unsupported file type"
                });

            }
            
            console.log("Extract text from image :::::::: >>> ",text);
            
            // Send response for both cases
            return res.status(200).json({
                res: text,
                confidence: ocrConfidence,
                isImage: isImage
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "No file uploaded"
            });

        }

    } catch (err) {

        console.error("OCR Error:", err);

        return res.status(500).json({
            status: "error",
            message: err.message
        });

    }
}

module.exports = { processReport };