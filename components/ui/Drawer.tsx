import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

type InputProps = {
	isOpen: boolean;
	onClose?: () => void;
	children?: React.ReactElement;
};

const Drawer = ({ isOpen, onClose, children }: InputProps) => {
	const [isBrowser, setIsBrowser] = useState(false);

	useEffect(() => {
		setIsBrowser(true);
	}, []);

	const handleBackdropClick = () => {
		if (onClose) onClose();
	};

	const drawerContent = (
		<>
			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-end justify-center"
					onClick={handleBackdropClick}
				>
					<div className="fixed inset-0 bg-black opacity-60"></div>
					<div
						onClick={(e) => e.stopPropagation()}
						className="h-5/6 w-3/5 translate-y-0 transform rounded-t-3xl bg-white p-8 transition-all duration-300 ease-in-out"
					>
						{children}
					</div>
				</div>
			)}
		</>
	);

	if (isBrowser) {
		return createPortal(drawerContent, document.getElementById('drawer-root')!);
	} else {
		return null;
	}
};

export default Drawer;
