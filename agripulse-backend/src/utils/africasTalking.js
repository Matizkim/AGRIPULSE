import africastalking from "africastalking";

const { AT_API_KEY, AT_USERNAME } = process.env;

if (!AT_API_KEY) {
  console.error("Africa's Talking API Key is missing!");
}
// Initialize Africa's Talking SDK
const at = africastalking({
  apiKey: AT_API_KEY,        // sandbox key from .env
  username: AT_USERNAME || "sandbox",
});

// Export the SMS object
const SMS = at.SMS;

export default { SMS };
