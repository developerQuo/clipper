import HeadNavigation from './navigation/Head';
import Link from 'next/link';
import Image from 'next/image';

function Header() {
	return (
		<header className="navbar z-10 h-[100px] bg-transparent bg-opacity-90 px-4">
			<div className="flex-none">
				<label htmlFor="menu-drawer" className="btn-ghost btn-square btn">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						className="inline-block h-5 w-5 stroke-current"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path>
					</svg>
				</label>
			</div>
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
