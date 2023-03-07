import { GetServerSideProps } from "next";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { ColumnType } from "rc-table/lib/interface";
import { useContext } from "react";
import { useRecoilValue } from "recoil";
import Table from "../../../components/ui/Table";
import serverSideAuthGuard from "../../../components/utils/serverSideAuthGuard";
import { supabase } from "../../../lib/supabaseClient";
import NotificationContext from "../../../store/notification-context";
import { SelectedKeyState, SelectedKeyType } from "../../../store/table";

export type DataType = { id: string; name: string };

const columns: ColumnType<DataType>[] = [
	{
		title: "이름",
		dataIndex: "name",
	},
];

type InputProps = {
	clip: { data: DataType[]; error: any; count: number };
};

export default function Clip({ clip }: InputProps) {
	const selectedKey = useRecoilValue<SelectedKeyType>(SelectedKeyState);
	const router = useRouter();
	const notificationCtx = useContext(NotificationContext);
	const onCreate = () => {
		if (clip.count >= 2) {
			notificationCtx.showNotification({
				title: "",
				message: "클립은 최대 2개까지만 생성할 수 있습니다.",
				status: "warning",
			});
		} else {
			router.push("clip/mutate");
		}
	};
	const onUpdate = () => {
		router.push({ pathname: "clip/mutate", query: { id: selectedKey } });
	};
	const onDelete = () => {
		const TITLE = "클립 삭제";
		fetch("/api/clip/delete", {
			method: "POST",
			body: JSON.stringify({ clipId: selectedKey }),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				}

				return res.json().then((data) => {
					throw new Error(`${TITLE}을 실패하였습니다. \n${data}`);
				});
			})
			.then(() => {
				notificationCtx.showNotification({
					title: "성공!",
					message: `${TITLE}을 완료되었습니다.`,
					status: "success",
				});
				router.reload();
			})
			.catch((error) => {
				notificationCtx.showNotification({
					title: "실패!",
					message: error.message,
					status: "error",
				});
			});
	};
	return (
		<>
			<h1 className="text-center text-3xl font-bold">User Clip</h1>
			<div className="flex flex-col space-y-2">
				<div className="mx-4 flex items-center justify-between">
					<div className="font-semibold">Clip List</div>
					<div className="space-x-4">
						<button className="btn-success btn" onClick={onCreate}>
							추가
						</button>
						<button
							className="btn-info btn"
							onClick={onUpdate}
							disabled={!selectedKey}
						>
							수정
						</button>
						<button
							className="btn-error btn"
							onClick={onDelete}
							disabled={!selectedKey}
						>
							삭제
						</button>
					</div>
				</div>
				<Table data={clip.data} columns={columns} count={clip.count} />
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps<InputProps> = async (
	context,
) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	if (guard.hasOwnProperty("redirect")) return guard;
	console.log(guard.props.session.user.id);
	const clip = await supabase
		.from("clip")
		.select("id,name,user_clip(count)", { count: "exact" })
		.eq("user_clip.user_id", guard.props.session.user.id);
	return { props: { clip } };
};
