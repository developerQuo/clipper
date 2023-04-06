import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';
import Image from 'next/image';
import serverSideAuthGuard from '../../components/utils/serverSideAuthGuard';
import Personalization from '@/components/ui/auth/personalization';

type InputProps = {
	session: Session;
};

export default function Profile({ session }: InputProps) {
	const {
		user: { name, email, image },
	} = session;
	return (
		<>
			<h1 className="text-center text-3xl font-bold">User Profile</h1>
			<div className="mt-12 flex flex-col items-center space-y-4 text-xl font-semibold">
				<div className="avatar">
					<div className="w-24 rounded-full">
						<Image
							alt="profile-image"
							src={image ?? ''}
							width={64}
							height={64}
						/>
					</div>
				</div>
				<div>{name}</div>
				<div>{email}</div>
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	return serverSideAuthGuard(context);
};
