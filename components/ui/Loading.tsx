export default function Loading() {
	return (
		<div className="absolute inset-0">
			<div className="flex min-h-screen items-center justify-center">
				<div
					style={{ borderTopColor: 'transparent' }}
					className="loading h-8 w-8 animate-spin rounded-full border-4 border-blue-200"
				></div>
				<p className="ml-2 font-semibold">Loading...</p>
			</div>
		</div>
	);
}
