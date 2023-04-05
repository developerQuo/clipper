import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useContext } from 'react';
import NotificationContext from '../../../store/notification-context';

type MenuItemProps = {
	name: string;
	path?: string;
	onClick?: () => void;
};

function MenuItem({ name, path, onClick }: MenuItemProps) {
	return (
		<li key={path} className="btn-outline btn rounded-3xl">
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
		<nav className="text-xs font-bold lg:text-sm">
			<ul
				tabIndex={0}
				className="dropdown-content menu menu-compact mt-3 w-52 bg-base-100 p-2"
			>
				{session && <MenuItem name="Log out" path="/api/auth/signout" />}
			</ul>
		</nav>
	);
}

export default Navigation;
