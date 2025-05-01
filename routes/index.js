const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const shortener = require("../utils/shortener");

AWS.config.update({ region: process.env.AWS_REGION });
const dynamo = new AWS.DynamoDB.DocumentClient();
const table = process.env.DYNAMO_TABLE;

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth/google");
}

router.get("/", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/dashboard");
  res.render("index", { user: null, body: null });
});

router.get("/dashboard", ensureAuth, async (req, res) => {
  const result = await dynamo
    .scan({
      TableName: table,
      FilterExpression: "createdBy = :id",
      ExpressionAttributeValues: {
        ":id": req.user.google_id,
      },
    })
    .promise();

  res.render("dashboard", { user: req.user, urls: result.Items, body: null });
});

router.post("/shorten", ensureAuth, async (req, res) => {
  const { longUrl } = req.body;
  const shortCode = shortener();
  const item = {
    shortCode,
    longUrl,
    createdBy: req.user.google_id,
  };

  await dynamo
    .put({
      TableName: table,
      Item: item,
    })
    .promise();

  res.send(`Short URL: <a href="/${shortCode}">/${shortCode}</a>`);
});

router.get("/:code", async (req, res) => {
  const { code } = req.params;
  const result = await dynamo
    .get({
      TableName: table,
      Key: { shortCode: code },
    })
    .promise();
  if (result.Item) {
    res.redirect(result.Item.longUrl);
  } else {
    res.status(404).send("URL not found");
  }
});
module.exports = router;
