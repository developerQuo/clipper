import { useContext } from 'react';
import NotificationContext from '../../store/notification-context';
import Notification from '../ui/Notification';
import Header from './Header';
import SideNavigation from './navigation/Side';

function Layout({ children }: any) {
	const notificationCtx = useContext(NotificationContext);

	const activeNotification = notificationCtx.notification;

	return (
		<div className="relative flex h-full min-h-screen min-w-[360px] flex-col">
			<Header />
			<div className="drawer-mobile drawer flex-1">
				<input id="menu-drawer" type="checkbox" className="drawer-toggle" />
				<div className="drawer-content flex flex-col items-center justify-center">
					<main className="px-auto mt-[100px] pb-40 sm:px-20">{children}</main>
				</div>
				<div className="drawer-side">
					<label htmlFor="menu-drawer" className="drawer-overlay"></label>
					<SideNavigation />
				</div>
			</div>
			{activeNotification && <Notification {...activeNotification} />}
		</div>
	);
}

export default Layout;
