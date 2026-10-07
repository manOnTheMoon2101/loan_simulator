import type { PageLoad } from './$types';
import type { ProductsResponse, ValidationRulesResponse } from '#lib/types';

export const load: PageLoad = async ({ fetch }) => {
	const [productsRes, validationRes] = await Promise.all([
		fetch('/api/loans/products'),
		fetch('/api/loans/validation-rules')
	]);

	const { products }: ProductsResponse = await productsRes.json();
	const validationRules: ValidationRulesResponse = await validationRes.json();

	return { products, validationRules };
};
