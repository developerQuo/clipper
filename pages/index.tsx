import ChatDoc from '@/components/ui/chat';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import TestAI from '../components/ui/test-ai';
import { authOptions } from './api/auth/[...nextauth]';

// import { supabase } from "../lib/supabaseClient";

// TODO: add favicon
export default function HomePage(props: any) {
	const [showChild, setShowChild] = useState(false);

	// Wait until after client-side hydration to show
	useEffect(() => {
		setShowChild(true);
	}, []);

	if (!showChild) {
		// You can show some kind of placeholder UI here
		return null;
	}
	return (
		<div className="space-y-20">
			<ChatDoc />
		</div>
	);
}
