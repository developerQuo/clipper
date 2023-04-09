import Image from 'next/image';

export default function SizeInfo() {
	return (
		<div className="h-full">
			<div className="absolute mx-12 my-10">
				<Image
					src="/images/logo/clipper_logo.png"
					alt="Logo"
					width={102}
					height={32}
				/>
			</div>
			<div className="flex h-full flex-col items-center justify-center space-y-20 bg-white px-24 text-center">
				<div className="text-3xl font-semibold">
					<h1>Clipper works better</h1> <h1>when on the big screen….</h1>
				</div>
				<p className="text-lg font-medium">
					We recommend using a desktop as an optimal environment for exploring
					and creating various reports, also we are working hard to provide a
					good experience on smaller and cute devices.
				</p>
			</div>
		</div>
	);
}
