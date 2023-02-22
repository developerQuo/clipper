import { GetServerSideProps } from "next";
import ChangePasswordForm from "../../components/auth/change-password-form";
import serverSideAuthGuard from "../../components/utils/serverSideAuthGuard";

export default function ChangePassword() {
	return (
		<>
			<ChangePasswordForm />
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	return serverSideAuthGuard(context);
};
