import { cn } from '@/utils/cn';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

type MenuItemProps = {
	name: string;
	path?: string;
	onClick?: () => void;
	icon?: {
		name: string;
		width: number;
		height: number;
	};
	className?: string;
};

function MenuItem({ name, path, onClick, icon, className }: MenuItemProps) {
	return (
		<li key={path} className={cn('text-sm', className)}>
			{path ? (
				<Link href={path}>
					{icon && (
						<Image
							src={`/icons/${icon.name}.svg`}
							alt={`${icon.name}`}
							width={icon.width}
							height={icon.height}
						/>
					)}
					{name}
				</Link>
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
		<nav className="flex flex-1 flex-col justify-between bg-white pb-10 text-xs font-bold lg:text-sm">
			<div className="justify-start">
				<ul className="menu space-y-10 text-base-content">
					<MenuItem
						name="Live Clip"
						path="/"
						icon={{
							name: 'live-clip',
							width: 13.75,
							height: 14.96,
						}}
					/>
					{/* <MenuItem
						name="Trend"
						path="/trend"
						icon={{
							name: 'trend',
							width: 18.13,
							height: 11.88,
						}}
					/> */}
					{/* <MenuItem
						name="Generate"
						path="/generate"
						icon={{
							name: 'generate',
							width: 13.33,
							height: 12.99,
						}}
					/> */}
					<MenuItem
						name="Request"
						path="/request"
						icon={{
							name: 'generate',
							width: 13.33,
							height: 12.99,
						}}
					/>
					<MenuItem
						name="My Clip"
						path="/my-clip"
						icon={{
							name: 'my-clip',
							width: 11.67,
							height: 14.57,
						}}
					/>
					{/* <MenuItem
						className="btn rounded-3xl"
						name="무료체험"
						path="/user/plan"
					/> */}
				</ul>
			</div>
			{session && (
				<div className="justify-end">
					<div className="dropdown-top dropdown">
						<label tabIndex={0} className="m-1 cursor-pointer">
							<div className="avatar">
								<div className="w-10 rounded-full">
									<Image
										alt="profile-image"
										src={session.user.image ?? ''}
										width={36}
										height={36}
									/>
								</div>
							</div>
						</label>
						<ul
							tabIndex={0}
							className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
						>
							<li>
								<Link href="/api/auth/signout">로그아웃</Link>
							</li>
						</ul>
					</div>
				</div>
			)}
		</nav>
	);
}

export default Navigation;
