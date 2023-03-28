import { GetServerSideProps } from 'next';
import serverSideAuthGuard from '../../../components/utils/serverSideAuthGuard';
import { supabase } from '@/utils/supabase-client';
import Form, {
	IForm,
	SubTopicOptionType,
} from '../../../components/ui/clip/Form';
import { OptionType } from '../../../components/ui/types';
import { SubKeywordOutput } from '../../../store/clip';

type InputProps = {
	initialValues: IForm;
	mainTopicOptions: OptionType[];
	subTopicOptions: SubTopicOptionType;
	initialAiTopicOptions: SubKeywordOutput;
};

export default function MutateClip(props: InputProps) {
	const ACTION = props.initialValues?.id ? 'Update' : 'Create';

	return (
		<>
			<h1 className="text-center text-3xl font-bold">{ACTION} Clip</h1>
			<div className="flex flex-col space-y-2">
				<Form {...props} />
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	if (guard.hasOwnProperty('redirect')) return guard;

	const { id } = context.query;
	const { data: clipData } = await supabase
		.from('clip')
		.select(
			`
		id,
		name,
		clip_topic (
			ai_topic_id,
			customized_ai_topic (
				name,
				korean,
				sub_topic_id,
				sub_topic (
					main_topic_id
				)
			)
		)
		`,
		)
		.eq('id', id);

	const initialValues =
		clipData && clipData[0].clip_topic
			? ({
					id: clipData[0].id,
					name: clipData[0].name,
					aiTopic: (clipData[0].clip_topic as any)?.map(
						({ customized_ai_topic }: any) => customized_ai_topic.name,
					),
					subTopic: (clipData[0].clip_topic as any)[0].customized_ai_topic
						.sub_topic_id,
					mainTopic: (clipData[0].clip_topic as any)[0].customized_ai_topic
						.sub_topic.main_topic_id,
			  } as IForm)
			: null;
	const initialAiTopicOptions = clipData
		? (clipData[0].clip_topic as any)?.map(({ customized_ai_topic }: any) => ({
				en: customized_ai_topic.name,
				ko: customized_ai_topic.korean,
		  }))
		: null;
	const topics = await supabase.from('main_topic').select(`
		id,
		name,
		korean,
		sub_topic (
			id,
			name,
			korean
	)`);
	const mainTopicOptions: OptionType[] = [];
	let subTopicOptions: SubTopicOptionType = {};
	if (topics.statusText === 'OK') {
		topics.data?.forEach((mainTopic) => {
			mainTopicOptions.push({
				value: mainTopic.id,
				label: `${mainTopic.name}(${mainTopic.korean})`,
			});
			subTopicOptions[mainTopic.id] = [];
			if (Array.isArray(mainTopic.sub_topic)) {
				mainTopic.sub_topic.forEach((subTopic) => {
					subTopicOptions[mainTopic.id].push({
						value: subTopic.id,
						label: `${subTopic.name}(${subTopic.korean})`,
					});
				});
			}
		});
	}
	return {
		props: {
			initialValues,
			initialAiTopicOptions,
			mainTopicOptions,
			subTopicOptions,
		},
	};
};
