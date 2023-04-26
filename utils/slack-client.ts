import { App } from '@slack/bolt';

const token = process.env.SLACK_BOT_TOKEN;
const signingSecret = process.env.SLACK_SIGNING_SECRET;
const channel = process.env.SLACK_CHANNEL_ID;

const app = new App({
	token,
	signingSecret,
});

// Post a message to a channel your app is in using ID and message text
export async function publishMessage(text: string) {
	try {
		if (!channel || !token || !signingSecret) {
			throw new Error('Missing Slack Credentials');
		}

		const result = await app.client.chat.postMessage({
			channel,
			text,
		});

		console.log(result);
	} catch (error) {
		console.error(error);
	}
}
