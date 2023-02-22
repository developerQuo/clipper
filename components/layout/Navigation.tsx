import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useContext } from "react";
import NotificationContext from "../../store/notification-context";

type MenuItemProps = {
	name: string;
	path?: string;
	onClick?: () => void;
};

function MenuItem({ name, path, onClick }: MenuItemProps) {
	return (
		<li key={path} className="py-1 lg:p-6">
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

function Menu() {
	const notificationCtx = useContext(NotificationContext);
	const { data: session, status } = useSession();

	function logoutHandler() {
		notificationCtx.showNotification({
			title: `로그아웃 완료`,
			message: `로그아웃 되었습니다.`,
			status: "success",
		});
		signOut();
	}
	return (
		<>
			{session && <MenuItem name="마이페이지" path="/user/profile" />}
			{session && (
				<MenuItem name="비밀번호 변경" path="/user/change-password" />
			)}
			{session && <MenuItem name="로그아웃" onClick={logoutHandler} />}
			{!session && status !== "loading" && (
				<MenuItem name="로그인" path="/auth" />
			)}
		</>
	);
}

function Navigation() {
	return (
		<nav className="text-xs font-bold text-primary lg:text-sm">
			<ul className="hidden lg:flex">
				<Menu />
			</ul>
			<ul
				tabIndex={0}
				className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow lg:hidden"
			>
				<Menu />
			</ul>
		</nav>
	);
}

export default Navigation;
