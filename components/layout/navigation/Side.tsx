import { useSession } from 'next-auth/react';
import Link from 'next/link';

type MenuItemProps = {
	name: string;
	path?: string;
	onClick?: () => void;
};

function MenuItem({ name, path, onClick }: MenuItemProps) {
	return (
		<li key={path} className="self-center py-1 lg:p-6">
			{path ? (
				<Link href={path}>{name}</Link>
			) : (
				<button className="w-full" onClick={onClick}>
					{name}
				</button>
			)}
		</li>
	);
}

function Navigation() {
	const { data: session } = useSession();
	return (
		<nav className="flex flex-col justify-between text-xs font-bold lg:text-sm">
			<div className="justify-start">
				<ul className="menu w-40 bg-base-100 text-base-content">
					<MenuItem name="Live Chat" path="/" />
					<MenuItem name="Generate" path="/generate" />
					<MenuItem name="My Clip" path="/my-clip" />
				</ul>
			</div>
			<div className="justify-end">
				<ul className="menu w-40 bg-base-100 text-base-content">
					{session && <MenuItem name="Profile" path="/user/profile" />}
				</ul>
			</div>
		</nav>
	);
}

export default Navigation;
