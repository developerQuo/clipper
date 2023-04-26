import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase-client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { Request } from '@/components/ui/request/types';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { publishMessage } from '@/utils/slack-client';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== 'POST') {
		return;
	}

	// get user id
	const session = await getServerSession(req, res, authOptions);
	const user_id = session?.user?.id;

	const values = req.body as unknown as Request;

	if (!user_id || !values) {
		return res.status(400).json({ message: 'No question in the request' });
	}
	const inputValues = { ...values, user_id };
	try {
		const result = await supabase
			.from('request')
			.insert({ ...values, user_id });
		// await updateValues(
		// 	'1wtnZZVqnCOsLhoN4aBhSVy_BQp20N1nQiutKadpIrhw',
		// 	'A1',
		// 	'RAW',
		// 	inputValues,
		// );
		await publishMessage(
			`[${
				result.error ? 'Failed' : 'Success'
			}] Clipper App Request received by "${values.first_name} ${
				values.last_name
			}"`,
		);

		res.status(200).json({ ok: true });
	} catch (error) {
		console.log('error', error);
		res.status(200).json({ ok: false });
	}
}

async function updateValues(
	spreadsheetId: string,
	range: string,
	valueInputOption: string,
	_values: Request & { user_id: string },
) {
	const auth = new GoogleAuth({
		scopes: 'https://www.googleapis.com/auth/spreadsheets',
		credentials: {
			private_key: 'd8e23fe259f3a4a54a2f896931e4e4c14f6d6f7f',
			client_email: '452046615879-compute@developer.gserviceaccount.com',
		},
	});

	const service = google.sheets({ version: 'v4', auth });
	let values = [
		[Object.values(_values)],
		// Additional rows ...
	];
	console.log(values);
	const requestBody = {
		values,
	};
	try {
		const result = await service.spreadsheets.values.append({
			spreadsheetId,
			range,
			valueInputOption,
			requestBody,
		});
		console.log(`${result.data.updates?.updatedCells} cells appended.`);
		return result;
	} catch (err) {
		// TODO (developer) - Handle exception
		throw err;
	}
}
