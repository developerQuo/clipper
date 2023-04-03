import React, { useEffect } from 'react';
import { DefaultRecordType } from 'rc-table/lib/interface';
import BaseTable, {
	InputProps as BaseTableInputProps,
} from '@/components/ui/Table';
import { useRouter } from 'next/router';

type InputProps<RecordType> = BaseTableInputProps<RecordType> & {};

export default function Table<RecordType extends DefaultRecordType>({
	...props
}: InputProps<RecordType>) {
	const router = useRouter();
	const { contentId } = router.query;

	return (
		<BaseTable
			onRow={(record) => ({
				onClick: () => {
					if (contentId === record.id) {
						router.push(
							{ query: { ...router.query, contentId: undefined } },
							undefined,
							{ shallow: true },
						);
						return;
					}
					router.push(
						{ query: { ...router.query, contentId: record.id } },
						undefined,
						{ shallow: true },
					);
				},
				className: `cursor-pointer hover ${
					contentId === record.id && 'active'
				}`,
			})}
			{...props}
		/>
	);
}
