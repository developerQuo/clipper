import { GetServerSideProps } from "next";
import serverSideAuthGuard from "../../components/utils/serverSideAuthGuard";

export default function Profile() {
	return <>profile</>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	return serverSideAuthGuard(context);
};
