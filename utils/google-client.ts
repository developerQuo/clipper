import { google, GoogleApis } from 'googleapis';
import { Request } from '@/components/ui/request/types';

const client_email = process.env.GOOGLE_SPREADSHEET_CLIENT_EMAIL;
const private_key = process.env.GOOGLE_SPREADSHEET_PRIVATE_KEY?.split(
	String.raw`\n`,
).join('\n');
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

if (!client_email || !private_key || !spreadsheetId) {
	throw new Error('Missing Google SpreadSheet Credentials');
}

const GoogleAuth = new GoogleApis().auth.GoogleAuth

const auth = new GoogleAuth({
	scopes: 'https://www.googleapis.com/auth/spreadsheets',
	credentials: {
		private_key,
		client_email,
	},
});


export async function updateValues(_values: Request & { user_id: string }) {
	const service = google.sheets({ version: 'v4', auth });
	let values = [
		Object.values(_values),
		// Additional rows ...
	];
	console.log(values);
	const requestBody = {
		values,
	};
	try {
		const result = await service.spreadsheets.values.append({
			spreadsheetId,
			range: 'A2',
			valueInputOption: 'RAW',
			requestBody,
		});
		console.log(`${result.data.updates?.updatedCells} cells appended.`);
		return result;
	} catch (err) {
		// TODO (developer) - Handle exception
		throw err;
	}
}
