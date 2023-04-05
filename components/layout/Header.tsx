import HeadNavigation from './navigation/Head';
import Link from 'next/link';
import Image from 'next/image';

function Header() {
	return (
		<header className="navbar z-10 h-[100px] bg-transparent bg-opacity-90 px-4">
			<div className="navbar-start pl-[24px] lg:pl-[32px]">
				<div className="hidden lg:block">
					<Link
						href="/"
						className="flex items-baseline gap-x-3 text-2xl font-bold"
					>
						<Image
							src="/images/logo/wiillus_logo.svg"
							alt="Logo"
							width={101}
							height={30}
						/>
					</Link>
				</div>
				<div className="block lg:hidden">
					<Link
						href="/"
						className="flex items-baseline gap-x-3 text-base font-bold"
					>
						<Image
							src="/images/logo/wiillus_logo.svg"
							alt="Logo"
							width={60.5}
							height={15}
						/>
					</Link>
				</div>
			</div>
			<div className="navbar-end">
				<HeadNavigation />
			</div>
		</header>
	);
}

export default Header;
