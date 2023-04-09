import { useContext } from 'react';
import NotificationContext from '../../store/notification-context';
import Notification from '../ui/Notification';
import SideNavigation from './navigation/Side';
import Link from 'next/link';
import Image from 'next/image';
import SizeInfo from '../ui/size-info';

function Layout({ children }: any) {
	const notificationCtx = useContext(NotificationContext);

	const activeNotification = notificationCtx.notification;

	return (
		<div className="relative flex h-full min-h-screen min-w-[360px] flex-col">
			<div className="drawer-mobile drawer flex-1">
				<input id="menu-drawer" type="checkbox" className="drawer-toggle" />
				<div className="drawer-content bg-[#F1F3F9]">
					<div className="h-full md:hidden">
						<SizeInfo />
					</div>
					<main className="hidden h-full md:block">{children}</main>
				</div>
				<div className="drawer-side w-52 border-r">
					<label htmlFor="menu-drawer" className="drawer-overlay"></label>
					<div className="fixed flex h-full flex-col px-10">
						<div className="my-12">
							<Link
								href="/"
								className="flex items-baseline gap-x-3 text-2xl font-bold"
							>
								<Image
									src="/images/logo/clipper_logo.png"
									alt="Logo"
									width={102}
									height={32}
								/>
							</Link>
						</div>
						<SideNavigation />
					</div>
				</div>
			</div>
			{activeNotification && <Notification {...activeNotification} />}
		</div>
	);
}

export default Layout;
