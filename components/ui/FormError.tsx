import React from 'react';

interface IFormErrorProps {
	message?: string;
}

export const FormError: React.FC<IFormErrorProps> = ({ message }) => (
	<span className="font-medium text-error">{message}</span>
);
