function Button(props: any) {
	const { children, className, loading, ...rest } = props;
	return (
		<button
			className={`btn h-[56px] w-full text-text-light-primary ${className}`}
			{...rest}
		>
			{loading ? "Loading..." : children}
		</button>
	);
}

export default Button;
